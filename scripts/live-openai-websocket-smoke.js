const REALTIME_SESSION_READY_EVENTS = new Set(["session.created", "session.updated"]);

export function isRealtimeSessionReadyEvent(event) {
  return REALTIME_SESSION_READY_EVENTS.has(event?.type);
}

export async function runRealtimeWebSocketSmoke(config, WebSocketImpl = globalThis.WebSocket, options = {}) {
  const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(config.realtimeModel)}`;
  const events = [];
  const timeoutMs = options.timeoutMs ?? 20000;

  return new Promise((resolve, reject) => {
    let ws = null;
    let settled = false;
    const timeout = setTimeout(() => {
      settle("reject", new Error("Realtime WebSocket smoke timed out."));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timeout);
      try {
        ws?.close();
      } catch {
        // Socket may already be closed.
      }
    }

    function settle(type, value) {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      if (type === "resolve") {
        resolve(value);
      } else {
        reject(value);
      }
    }

    try {
      ws = new WebSocketImpl(url, {
        headers: {
          Authorization: `Bearer ${config.openaiApiKey}`
        }
      });
    } catch (error) {
      settle("reject", error);
      return;
    }

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({
        type: "session.update",
        session: {
          type: "realtime",
          model: config.realtimeModel,
          instructions: "Anchor generated live test. Respond briefly and safely.",
          audio: {
            output: { voice: "marin" }
          }
        }
      }));
    });

    ws.addEventListener("message", event => {
      try {
        const parsed = JSON.parse(String(event.data));
        events.push(parsed);
        if (isRealtimeSessionReadyEvent(parsed)) {
          settle("resolve", { connected: true, events: [...events] });
        } else if (parsed.type === "error") {
          settle("reject", new Error(parsed.error?.message || "Realtime WebSocket returned an error."));
        }
      } catch (error) {
        settle("reject", error);
      }
    });

    ws.addEventListener("error", () => {
      settle("reject", new Error("Realtime WebSocket connection failed."));
    });

    ws.addEventListener("close", event => {
      const code = event?.code ? ` (code ${event.code})` : "";
      const reason = event?.reason ? `: ${event.reason}` : "";
      settle("reject", new Error(`Realtime WebSocket closed before ready${code}${reason}`));
    });
  });
}
