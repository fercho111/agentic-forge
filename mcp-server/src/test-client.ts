import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function main() {
  const serverUrl = process.env.MCP_SERVER_URL ?? "http://localhost:8080";
  const sharedSecret = process.env.MCP_SHARED_SECRET ?? "local-dev-secret";
  const origin = process.env.MCP_ALLOWED_ORIGIN ?? "http://localhost:3000";

  const transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${sharedSecret}`,
        Origin: origin,
      },
    },
  });

  const client = new Client({
    name: "agentic-forge-mcp-test-client",
    version: "0.1.0",
  });

  await client.connect(transport);

  const tools = await client.listTools();
  console.log("TOOLS:", JSON.stringify(tools, null, 2));

  const markdownResult = await client.callTool({
    name: "export_markdown",
    arguments: {
      projectTitle: "Agentic Forge MCP Test",
      problemSummary: "Validate remote MCP export tool end-to-end.",
      targetUsers: ["Developer"],
      functionalRequirements: [
        "Tool should accept structured input",
        "Tool should return markdown output",
      ],
      userStories: [
        "As a developer, I want to test the MCP transport so I can safely integrate it into the Next app.",
      ],
      technicalProposal: [
        "Use MCP Streamable HTTP transport",
        "Secure requests with origin validation and bearer secret",
      ],
      dataEntities: ["Project", "AgentStep"],
      openQuestions: ["Should persistence also move into MCP next?"],
      reviewNotes: ["This is a transport validation test."],
    },
  });

  console.log("MARKDOWN RESULT:", JSON.stringify(markdownResult, null, 2));

  await client.close();
}

main().catch((error) => {
  console.error("MCP test client failed:", error);
  process.exit(1);
});