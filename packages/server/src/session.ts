import type { Env } from "./types.js";

/**
 * PolicySession — a Durable Object for live enforcement sessions.
 *
 * One DO per active agent session (keyed by `orgId:sessionKey`).
 * Holds live state: current policy, tool-call history, running violation
 * count, actor attribution. Exposes WebSocket to the browser dashboard
 * so violations stream in real-time, no polling.
 *
 * Session-scoped rules can be enforced here (e.g., "max 5 block-level
 * violations per session → auto-kill").
 */

export interface SessionState {
  orgId: number;
  sessionKey: string;
  policy: string;
  startedAt: number;
  toolCalls: number;
  violations: number;
  blocked: number;
  byActor: { agent: number; human: number };
  byRule: Record<string, number>;
  status: "active" | "killed" | "completed";
  lastActivity: number;
}

interface WSMessage {
  type: "state" | "violation" | "tool_call" | "killed" | "policy_updated";
  data: any;
  ts: number;
}

export class PolicySession {
  private sessionState: SessionState;
  private env: Env;
  private storage: DurableObjectStorage;
  private websockets: Set<WebSocket> = new Set();

  constructor(private doState: DurableObjectState, env: Env) {
    this.storage = doState.storage;
    this.env = env;
    // Initialize with defaults; load() will restore persisted state
    this.sessionState = {
      orgId: 0,
      sessionKey: "",
      policy: "",
      startedAt: Date.now(),
      toolCalls: 0,
      violations: 0,
      blocked: 0,
      byActor: { agent: 0, human: 0 },
      byRule: {},
      status: "active",
      lastActivity: Date.now(),
    };
    // Load any persisted state (DO can be hibernated/revived)
    this.load().catch(() => {});
  }

  private async load(): Promise<void> {
    const persisted = await this.storage.get<SessionState>("state");
    if (persisted) this.sessionState = persisted;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade — browser dashboard connects here
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
      server.accept();
      this.websockets.add(server);

      // Send current state on connect
      this.send(server, { type: "state", data: this.sessionState, ts: Date.now() });

      server.addEventListener("close", () => this.websockets.delete(server));
      server.addEventListener("error", () => this.websockets.delete(server));

      return new Response(null, { status: 101, webSocket: client });
    }

    // REST API for the CLI/hook to report into
    if (request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as any;

      if (body.type === "init") {
        return this.init(body);
      }
      if (body.type === "tool_call") {
        return this.recordToolCall(body);
      }
      if (body.type === "violation") {
        return this.recordViolation(body);
      }
      if (body.type === "complete") {
        return this.complete();
      }
    }

    // GET current state
    if (request.method === "GET") {
      return new Response(JSON.stringify(this.sessionState), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  }

  private async init(body: any): Promise<Response> {
    this.sessionState.orgId = body.orgId ?? 0;
    this.sessionState.sessionKey = body.sessionKey ?? `session-${Date.now()}`;
    this.sessionState.policy = body.policy ?? "";
    this.sessionState.startedAt = Date.now();
    this.sessionState.status = "active";
    await this.persist();
    this.broadcast({ type: "state", data: this.sessionState, ts: Date.now() });
    return new Response(JSON.stringify({ ok: true, sessionKey: this.sessionState.sessionKey }), {
      headers: { "content-type": "application/json" },
    });
  }

  private async recordToolCall(body: any): Promise<Response> {
    if (this.sessionState.status === "killed") {
      return new Response(JSON.stringify({ ok: false, reason: "session_killed" }), {
        headers: { "content-type": "application/json" },
      });
    }
    this.sessionState.toolCalls++;
    this.sessionState.lastActivity = Date.now();
    if (body.actor === "human") this.sessionState.byActor.human++;
    else this.sessionState.byActor.agent++;
    await this.persist();
    this.broadcast({ type: "tool_call", data: { actor: body.actor }, ts: Date.now() });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  private async recordViolation(body: any): Promise<Response> {
    if (this.sessionState.status === "killed") {
      return new Response(JSON.stringify({ ok: false, reason: "session_killed" }), {
        headers: { "content-type": "application/json" },
      });
    }
    this.sessionState.violations++;
    if (body.enforce === "block") this.sessionState.blocked++;
    this.sessionState.byRule[body.ruleId ?? "unknown"] = (this.sessionState.byRule[body.ruleId ?? "unknown"] ?? 0) + 1;
    if (body.actor === "human") this.sessionState.byActor.human++;
    else this.sessionState.byActor.agent++;
    this.sessionState.lastActivity = Date.now();

    // Session-scoped rule: auto-kill after 5 block-level violations
    if (this.sessionState.blocked >= 5) {
      this.sessionState.status = "killed";
    }

    await this.persist();
    this.broadcast({
      type: "violation",
      data: { ruleId: body.ruleId, enforce: body.enforce, actor: body.actor },
      ts: Date.now(),
    });
    if (this.sessionState.status === "killed") {
      this.broadcast({ type: "killed", data: { reason: "max_blocked_exceeded" }, ts: Date.now() });
    }
    return new Response(JSON.stringify({ ok: true, status: this.sessionState.status }), {
      headers: { "content-type": "application/json" },
    });
  }

  private async complete(): Promise<Response> {
    this.sessionState.status = "completed";
    this.sessionState.lastActivity = Date.now();
    await this.persist();
    this.broadcast({ type: "state", data: this.sessionState, ts: Date.now() });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  private send(ws: WebSocket, msg: WSMessage) {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      this.websockets.delete(ws);
    }
  }

  private broadcast(msg: WSMessage) {
    for (const ws of this.websockets) this.send(ws, msg);
  }

  private async persist() {
    try {
      await this.storage.put("state", this.sessionState);
    } catch {
      /* best-effort */
    }
  }
}
