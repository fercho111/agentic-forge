import http from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { assertAuthorizedRequest } from "./auth.js";
import { exportMarkdown } from "./tools/exportMarkdown.js";
import { updateProject, updateProjectToolMeta } from "./tools/updateProject.js";
import {
  logAgentStepStart,
  logAgentStepStartToolMeta,
} from "./tools/logAgentStepStart.js";
import {
  logAgentStepEnd,
  logAgentStepEndToolMeta,
} from "./tools/logAgentStepEnd.js";

type SessionEntry = {
  server: McpServer;
  transport: StreamableHTTPServerTransport;
};

const sessions = new Map<string, SessionEntry>();

function nowIso() {
  return new Date().toISOString();
}

function logInfo(message: string, meta?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      level: "info",
      ts: nowIso(),
      message,
      ...(meta ?? {}),
    })
  );
}

function logError(message: string, meta?: Record<string, unknown>) {
  console.error(
    JSON.stringify({
      level: "error",
      ts: nowIso(),
      message,
      ...(meta ?? {}),
    })
  );
}

function getRequestMeta(req: http.IncomingMessage) {
  return {
    method: req.method ?? "UNKNOWN",
    url: req.url ?? "",
    origin: req.headers.origin ?? null,
    hasAuthHeader: Boolean(req.headers.authorization),
    sessionIdHeader:
      typeof req.headers["mcp-session-id"] === "string"
        ? req.headers["mcp-session-id"]
        : null,
    userAgent: req.headers["user-agent"] ?? null,
  };
}

function createMcpServer() {
  const mcpServer = new McpServer({
    name: "agentic-forge-mcp",
    version: "0.1.0",
  });

  mcpServer.registerTool(
    "export_markdown",
    {
      description:
        "Generate a markdown specification document from the structured project state.",
      inputSchema: {
        projectTitle: z.string().optional(),
        problemSummary: z.string().optional(),
        targetUsers: z.array(z.string()).optional(),
        functionalRequirements: z.array(z.string()).optional(),
        userStories: z.array(z.string()).optional(),
        technicalProposal: z.array(z.string()).optional(),
        dataEntities: z.array(z.string()).optional(),
        openQuestions: z.array(z.string()).optional(),
        reviewNotes: z.array(z.string()).optional(),
      },
    },
    async (args) => {
      const startedAt = Date.now();
      logInfo("MCP tool invoked", {
        tool: "export_markdown",
        argKeys: Object.keys(args ?? {}),
      });

      try {
        const markdown = exportMarkdown(args);

        logInfo("MCP tool success", {
          tool: "export_markdown",
          durationMs: Date.now() - startedAt,
          markdownLength: markdown.length,
        });

        return {
          content: [{ type: "text", text: markdown }],
          structuredContent: { markdown },
        };
      } catch (error) {
        logError("MCP tool failed", {
          tool: "export_markdown",
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }
  );

  mcpServer.registerTool(
    updateProjectToolMeta.name,
    {
      description: updateProjectToolMeta.description,
      inputSchema: {
        projectId: z.string().uuid(),
        projectTitle: z.string().optional(),
        finalJson: z.unknown(),
        markdownOutput: z.string().optional(),
      },
    },
    async (args) => {
      const startedAt = Date.now();
      logInfo("MCP tool invoked", {
        tool: "update_project",
        projectId:
          typeof args?.projectId === "string" ? args.projectId : null,
      });

      try {
        const updatedProject = await updateProject(args);

        logInfo("MCP tool success", {
          tool: "update_project",
          durationMs: Date.now() - startedAt,
          projectId: updatedProject.id,
        });

        return {
          content: [
            {
              type: "text",
              text: "Project updated successfully.",
            },
          ],
          structuredContent: {
            project: updatedProject,
          },
        };
      } catch (error) {
        logError("MCP tool failed", {
          tool: "update_project",
          durationMs: Date.now() - startedAt,
          projectId:
            typeof args?.projectId === "string" ? args.projectId : null,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }
  );

  mcpServer.registerTool(
    logAgentStepStartToolMeta.name,
    {
      description: logAgentStepStartToolMeta.description,
      inputSchema: {
        userId: z.string().uuid(),
        projectId: z.string().uuid().nullable().optional(),
        agentName: z.string().min(1),
        modelName: z.string().nullable().optional(),
        retryAttempt: z.number().int().nonnegative().optional(),
        inputSnapshot: z.unknown().optional(),
        traceName: z.string().nullable().optional(),
      },
    },
    async (args) => {
      const startedAt = Date.now();
      logInfo("MCP tool invoked", {
        tool: "log_agent_step_start",
        agentName:
          typeof args?.agentName === "string" ? args.agentName : null,
        projectId:
          typeof args?.projectId === "string" ? args.projectId : null,
        retryAttempt:
          typeof args?.retryAttempt === "number" ? args.retryAttempt : 0,
      });

      try {
        const step = await logAgentStepStart(args);

        logInfo("MCP tool success", {
          tool: "log_agent_step_start",
          durationMs: Date.now() - startedAt,
          stepId: step.id,
          agentName: step.agent_name,
        });

        return {
          content: [
            {
              type: "text",
              text: "Agent step start logged successfully.",
            },
          ],
          structuredContent: {
            step,
          },
        };
      } catch (error) {
        logError("MCP tool failed", {
          tool: "log_agent_step_start",
          durationMs: Date.now() - startedAt,
          agentName:
            typeof args?.agentName === "string" ? args.agentName : null,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }
  );

  mcpServer.registerTool(
    logAgentStepEndToolMeta.name,
    {
      description: logAgentStepEndToolMeta.description,
      inputSchema: {
        stepId: z.string().uuid(),
        status: z.enum(["success", "failed"]),
        outputSnapshot: z.unknown().optional(),
        errorMessage: z.string().nullable().optional(),
      },
    },
    async (args) => {
      const startedAt = Date.now();
      logInfo("MCP tool invoked", {
        tool: "log_agent_step_end",
        stepId: typeof args?.stepId === "string" ? args.stepId : null,
        status: typeof args?.status === "string" ? args.status : null,
      });

      try {
        const step = await logAgentStepEnd(args);

        logInfo("MCP tool success", {
          tool: "log_agent_step_end",
          durationMs: Date.now() - startedAt,
          stepId: step.id,
          agentName: step.agent_name,
          status: step.status,
        });

        return {
          content: [
            {
              type: "text",
              text: "Agent step end logged successfully.",
            },
          ],
          structuredContent: {
            step,
          },
        };
      } catch (error) {
        logError("MCP tool failed", {
          tool: "log_agent_step_end",
          durationMs: Date.now() - startedAt,
          stepId: typeof args?.stepId === "string" ? args.stepId : null,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }
  );

  return mcpServer;
}

async function getOrCreateSessionTransport(req: http.IncomingMessage) {
  const requestedSessionId = req.headers["mcp-session-id"];
  const sessionId =
    typeof requestedSessionId === "string" ? requestedSessionId : null;

  if (sessionId && sessions.has(sessionId)) {
    logInfo("Reusing MCP session", {
      sessionId,
      activeSessions: sessions.size,
    });
    return sessions.get(sessionId)!.transport;
  }

  const newSessionId = randomUUID();
  const server = createMcpServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => newSessionId,
  });

  transport.onclose = async () => {
    logInfo("Closing MCP session", {
      sessionId: newSessionId,
      activeSessionsBeforeClose: sessions.size,
    });
    sessions.delete(newSessionId);
    await server.close();
    logInfo("Closed MCP session", {
      sessionId: newSessionId,
      activeSessionsAfterClose: sessions.size,
    });
  };

  await server.connect(transport);

  sessions.set(newSessionId, {
    server,
    transport,
  });

  logInfo("Created new MCP session", {
    sessionId: newSessionId,
    activeSessions: sessions.size,
  });

  return transport;
}

const httpServer = http.createServer(async (req, res) => {
  const startedAt = Date.now();
  const requestMeta = getRequestMeta(req);

  logInfo("Incoming MCP HTTP request", requestMeta);

  try {
    assertAuthorizedRequest(req);
    logInfo("MCP request authorized", requestMeta);

    const transport = await getOrCreateSessionTransport(req);
    await transport.handleRequest(req, res);

    logInfo("MCP request handled", {
      ...requestMeta,
      durationMs: Date.now() - startedAt,
      statusCode: res.statusCode,
    });
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode?: number }).statusCode ?? 500)
        : 500;

    logError("MCP request failed", {
      ...requestMeta,
      durationMs: Date.now() - startedAt,
      statusCode,
      error: error instanceof Error ? error.message : "Internal MCP error",
    });

    res.statusCode = statusCode;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        ok: false,
        message: error instanceof Error ? error.message : "Internal MCP error",
      })
    );
  }
});

const port = Number(process.env.PORT ?? 8080);

httpServer.listen(port, () => {
  logInfo("Agentic Forge MCP server listening", {
    port,
    hasAllowedOrigin: Boolean(process.env.MCP_ALLOWED_ORIGIN),
    hasSharedSecret: Boolean(process.env.MCP_SHARED_SECRET),
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasSupabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
});