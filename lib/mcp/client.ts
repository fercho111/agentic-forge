import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export async function createMcpClient() {
  const serverUrl = process.env.MCP_SERVER_URL;
  const sharedSecret = process.env.MCP_SHARED_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!serverUrl) {
    throw new Error("MCP_SERVER_URL is not configured");
  }

  if (!sharedSecret) {
    throw new Error("MCP_SHARED_SECRET is not configured");
  }

  const transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${sharedSecret}`,
        Origin: siteUrl ?? "http://localhost:3000",
      },
    },
  });

  const client = new Client({
    name: "agentic-forge-next-client",
    version: "0.1.0",
  });

  await client.connect(transport);

  return client;
}