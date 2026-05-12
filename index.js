import express from 'express';
import { randomUUID } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { registerTools } from './tools.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Store active transports by session ID
const transports = {};

function createServer() {
  const server = new Server(
    {
      name: 'banatit-timisoara-mcp-server',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );
  registerTools(server);
  return server;
}

// Streamable HTTP endpoint — POST handles all client→server messages
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];

  if (sessionId && transports[sessionId]) {
    await transports[sessionId].handleRequest(req, res, req.body);
    return;
  }

  // New session — must be an initialize request
  if (!isInitializeRequest(req.body)) {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Bad Request: No valid session ID and not an initialize request' },
      id: null
    });
    return;
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  const server = createServer();
  await server.connect(transport);

  transports[transport.sessionId] = transport;

  const originalOnClose = transport.onclose;
  transport.onclose = () => {
    delete transports[transport.sessionId];
    if (originalOnClose) originalOnClose();
  };

  await transport.handleRequest(req, res, req.body);
});

// GET opens an SSE stream for server-initiated notifications
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (sessionId && transports[sessionId]) {
    await transports[sessionId].handleRequest(req, res);
    return;
  }
  res.status(400).json({
    jsonrpc: '2.0',
    error: { code: -32600, message: 'Bad Request: No valid session ID' },
    id: null
  });
});

// DELETE terminates a session
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (sessionId && transports[sessionId]) {
    await transports[sessionId].handleRequest(req, res);
    delete transports[sessionId];
    return;
  }
  res.status(400).json({
    jsonrpc: '2.0',
    error: { code: -32600, message: 'Bad Request: No valid session ID' },
    id: null
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`BanatIT MCP Server running on port ${PORT}`);
  console.log(`Streamable HTTP endpoint: http://localhost:${PORT}/mcp`);
});
