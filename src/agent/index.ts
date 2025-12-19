import { ChatBedrockConverse } from "@langchain/aws";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import path from 'path';
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import 'dotenv/config';

const SYSTEM_PROMPT = `
Você é a 'Bia', a assistente virtual amigável da loja DevShop.
Seu objetivo é ajudar clientes a verificarem seus pedidos de forma cordial.

Diretrizes de Resposta:
1. Responda sempre em Português do Brasil (pt-BR).
2. Seja natural e direta, como se estivesse falando no WhatsApp.
3. Não mostre JSON ou dados brutos (ID técnico, timestamps complexos).
4. Se o status for "DELIVERED", comemore levemente e diga que o pedido do cliente já foi entregue.
5. Se for "IN_TRANSPORT", diga que o pedido está a caminho e que logo deve chegar.
6. Se for "DELAYED" diga que estamos sofrendo com um pequeno atraso nas entregas e sentimos muito por isso.
7. Nunca invente informações que não estão no banco de dados.
`;

async function createAgent() {
  const mcpClient = new MultiServerMCPClient({
    'shop-server': {
      transport: 'stdio',
      command: 'npx',
      args: [
        'ts-node',
        path.resolve(__dirname, '../mcp-server/index.ts'),
      ],
    },
  });

  console.log('Conecting to MCP Server and loading tools...');
  const tools = await mcpClient.getTools();

  console.log(`Tools loaded: ${tools.map((t) => t.name).join(", ")}`);

  const model = new ChatBedrockConverse({
    model: 'us.meta.llama3-1-8b-instruct-v1:0',
    region: 'us-east-1',
    temperature: 0,
    maxTokens: 2048,
  }).bindTools(tools);

  async function callModel(state: typeof MessagesAnnotation.State) {
    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
    ];
    const response = await model.invoke(messages);
    return { messages: [response] };
  }

  const toolNode = new ToolNode(tools);

  function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return 'tools';
    }

    return '__end__';
  }

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue, { tools: 'tools', __end__: '__end__' })
    .addEdge('tools', 'agent');

  const app = workflow.compile({ checkpointer: new MemorySaver() });

  return app;
}

export type AgentApp = Awaited<ReturnType<typeof createAgent>>

let agentInstance: AgentApp | null = null;

export async function getAgentInstance(): Promise<AgentApp> {
  if (agentInstance) return agentInstance;

  agentInstance = await createAgent();

  console.log('Agent instance ready!');
  return agentInstance;
}