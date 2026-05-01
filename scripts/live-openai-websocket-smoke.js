export async function runRealtimeWebSocketSmoke(config, WebSocketImpl = WebSocket) {
  const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(config.realtimeModel)}`;
  const events = [];

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Realtime WebSocket smoke timed out."));
    }, 20000);

    const ws = new WebSocketImpl(url, {
      headers: {
        Authorization: `Bearer ${config.openaiApiKey}`
      }
    });

    function cleanup() {
      clearTimeout(timeout);
      try {
        ws.close();
      } catch {
        // Socket may already be closed.
      }
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
        if (parsed.type === "session.created" || parsed.type === "session.updated") {
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
