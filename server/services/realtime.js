export function createRealtimeClient(config, fetchImpl = fetch) {
  return {
    async createCall({ sdpOffer, session }) {
      if (config.appEnv !== "production" && config.forceRealtimeNetwork !== true) {
        return {
          sdpAnswer: "v=0\r\no=- 2 2 IN IP4 127.0.0.1\r\ns=Anchor Local Answer\r\n",
          openAiCallId: "local_realtime_call"
        };
      }

      const body = new FormData();
      body.set("sdp", sdpOffer);
      body.set("session", JSON.stringify(session));

      const response = await fetchImpl(config.openaiRealtimeCallsUrl, {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.openaiApiKey}`
        },
        body
      });

      const sdpAnswer = await response.text();
      if (!response.ok) {
        throw new Error("Realtime call could not be created.");
      }

      return {
        sdpAnswer,
        openAiCallId: callIdFromLocation(response.headers.get("location"))
      };
    },

    async hangup(openAiCallId) {
      if (!openAiCallId || (!config.openaiApiKey && config.appEnv !== "production")) {
        return true;
      }

      await fetchImpl(`${config.openaiRealtimeCallsUrl}/${encodeURIComponent(openAiCallId)}/hangup`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.openaiApiKey}`
        }
      });
      return true;
    }
  };
}

function callIdFromLocation(location) {
  if (!location) return null;
  return location.split("/").filter(Boolean).at(-1) ?? null;
}
