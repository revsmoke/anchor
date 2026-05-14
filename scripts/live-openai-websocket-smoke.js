const REALTIME_SESSION_READY_EVENTS = new Set(["session.created", "session.updated"]);

export function isRealtimeSessionReadyEvent(event) {
  return REALTIME_SESSION_READY_EVENTS.has(event?.type);
}

export async function runRealtimeWebSocketSmoke(config, WebSocketImpl = globalThis.WebSocket) {
  const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(config.realtimeModel)}`;
  const events = [];

  return new Promise((resolve, reject) => {
    let ws = null;
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Realtime WebSocket smoke timed out."));
    }, 20000);

    function cleanup() {
      clearTimeout(timeout);
      try {
        ws?.close();
      } catch {
        // Socket may already be closed.
      }
    }

    try {
      ws = new WebSocketImpl(url, {
        headers: {
          Authorization: `Bearer ${config.openaiApiKey}`
        }
      });
    } catch (error) {
      cleanup();
      reject(error);
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
          cleanup();
          resolve({ connected: true, events });
        } else if (parsed.type === "error") {
          cleanup();
          reject(new Error(parsed.error?.message || "Realtime WebSocket returned an error."));
        }
      } catch (error) {
        cleanup();
        reject(error);
      }
    });

    ws.addEventListener("error", () => {
      cleanup();
      reject(new Error("Realtime WebSocket connection failed."));
    });
  });
}
