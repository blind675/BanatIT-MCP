import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerTools } from './tools.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Create MCP server
const mcpServer = new Server(
  {
    name: 'banatit-mcp-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Register tools
registerTools(mcpServer);

// SSE endpoint
app.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  await mcpServer.connect(transport);
});

// Messages endpoint (for client → server communication)
app.post('/messages', express.json(), async (req, res) => {
  // The SSE transport handles this, but we keep the route for completeness
  res.status(200).send();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`BanatIT MCP Server running on port ${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});
