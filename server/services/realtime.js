export function createRealtimeClient(config, fetchImpl = fetch) {
  const timeoutMs = Number(config.openaiRealtimeTimeoutMs ?? 30000);

  return {
    async createCall({ sdpOffer, session, forceNetwork = false }) {
      if (config.appEnv !== "production" && config.forceRealtimeNetwork !== true && forceNetwork !== true) {
        return {
          sdpAnswer: "v=0\r\no=- 2 2 IN IP4 127.0.0.1\r\ns=Anchor Local Answer\r\n",
          openAiCallId: "local_realtime_call"
        };
      }

      if (!config.openaiApiKey) {
        throw new Error("Realtime call requires OPENAI_API_KEY.");
      }

      const body = new FormData();
      const normalizedSdpOffer = normalizeSdp(sdpOffer);
      body.set("sdp", normalizedSdpOffer);
      body.set("session", JSON.stringify(session));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(config.openaiRealtimeCallsUrl, {
          method: "POST",
          headers: {
            authorization: `Bearer ${config.openaiApiKey}`
          },
          body,
          signal: controller.signal
        });

        const sdpAnswer = await response.text();
        if (!response.ok) {
          throw new Error(`Realtime call could not be created (${response.status}, sdp_length=${normalizedSdpOffer.length}): ${safeErrorText(sdpAnswer)}`);
        }

        return {
          sdpAnswer,
          openAiCallId: callIdFromLocation(response.headers.get("location"))
        };
      } catch (error) {
        if (error?.name === "AbortError") {
          throw new Error("Realtime call timed out.");
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    },

    async hangup(openAiCallId, { forceNetwork = false } = {}) {
      if (
        !openAiCallId ||
        (config.appEnv !== "production" && config.forceRealtimeNetwork !== true && forceNetwork !== true)
      ) {
        return true;
      }

      const response = await fetchImpl(`${config.openaiRealtimeCallsUrl}/${encodeURIComponent(openAiCallId)}/hangup`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.openaiApiKey}`
        }
      });
      if (!response.ok) {
        throw new Error("Realtime call hangup failed.");
      }
      return true;
    }
  };
}

function callIdFromLocation(location) {
  if (!location) return null;
  return location.split("/").filter(Boolean).at(-1) ?? null;
}

function safeErrorText(value) {
  return String(value ?? "")
    .replace(/sk-[a-zA-Z0-9_-]+/g, "[REDACTED_OPENAI_API_KEY]")
    .slice(0, 500);
}

function normalizeSdp(value) {
  const normalized = String(value ?? "").replace(/\r?\n/g, "\r\n").trimEnd();
  return normalized.endsWith("\r\n") ? normalized : `${normalized}\r\n`;
}
