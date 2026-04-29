# OpenAI Architecture Memo: Multi-Agent, Voice-Enabled App

## Recommendation

Build the app as a server-owned orchestration layer with three OpenAI surfaces:

- **Agents SDK** for multi-agent control flow, handoffs, guardrails, tracing, and tool wiring.
- **Responses API** for stateful text/tool turns when a specialist or workflow does not need live audio.
- **Realtime API** for live voice sessions and low-latency speech-to-speech interaction.

OpenAI’s docs are explicit that the SDK is the right fit when the server owns orchestration, tool execution, state, and approvals ([Agents SDK: Build with the SDK](https://developers.openai.com/api/docs/guides/agents#build-with-the-sdk)). Voice is still an SDK-first surface, and OpenAI recommends the Realtime API for natural low-latency live audio sessions ([Voice agents: Choose the right architecture](https://developers.openai.com/api/docs/guides/voice-agents#choose-the-right-architecture), [Audio: Streaming audio](https://developers.openai.com/api/docs/guides/audio#streaming-audio)).

## Reference Architecture

### 1) One user-facing app, one orchestrator

Use a single manager/orchestrator agent to own the user-facing reply. Model each domain expert as a specialist agent with a narrow contract:

- `name` for trace readability
- `instructions` for that specialist’s job and constraints
- `tools` for only the capabilities that specialist should call directly
- `handoffs` and `handoffDescription` when another specialist should take over
- `outputType` when the specialist should return structured data instead of prose

This is the cleanest way to keep ownership explicit and avoid blending all domains into one prompt blob ([Agent definitions: What belongs on an agent](https://developers.openai.com/api/docs/guides/agents/define-agents#what-belongs-on-an-agent)).

For collaboration style, pick one of two patterns:

- **Handoff-first** for open-ended conversational workflows where a specialist should take over the turn.
- **Agent-as-tool** for manager-style workflows where the orchestrator keeps control and asks specialists for sub-results.

OpenAI’s orchestration guidance describes orchestration as handling multi-step work, tool use, handoffs, guardrails, and context, and recommends the Agents SDK for that layer ([Building agents: Orchestration](https://developers.openai.com/tracks/building-agents#orchestration)). The portfolio-collaboration cookbook also contrasts handoff collaboration with agent-as-tool control flow, with the latter keeping a single thread of control.

### 2) Keep memory boundaries explicit

Treat memory as layered, not global:

- **User/session memory**: what should persist across turns for the whole app.
- **Specialist memory**: only the facts that matter to that domain expert.
- **Ephemeral run state**: transient work products, validation state, and intermediate reasoning.

If you use the Responses API directly, OpenAI supports stateful context with `store: true`, preserving reasoning and tool context from turn to turn ([Responses benefits](https://developers.openai.com/api/docs/guides/migrate-to-responses#responses-benefits)). If you need stateless operation or ZDR-style constraints, use encrypted reasoning items instead of persistent state ([Encrypted reasoning items](https://developers.openai.com/cookbook/examples/responses_api/reasoning_items#encrypted-reasoning-items)).

Implementation implication: do **not** copy the full global transcript into every specialist. Pass only the minimum context each specialist needs, and let the orchestrator own cross-domain continuity.

### 3) Use Realtime for live voice, not as the whole architecture

For live speech sessions, use the Realtime API as the transport and turn-detection layer. OpenAI’s docs recommend:

- **Speech-to-speech with live audio sessions** when you want the model to handle live audio in and out directly.
- **Chained voice pipeline** when you want predictable workflows or are extending a text agent and need explicit control over transcription, reasoning, and speech output.

The Realtime API can stream audio in and out, and OpenAI’s speech models add low-latency ASR and multilingual support ([Audio: Streaming audio](https://developers.openai.com/api/docs/guides/audio#streaming-audio)). For turn handling, VAD emits `speech_started` and `speech_stopped` events, with `server_vad` as the default and `semantic_vad` available when utterance boundary detection should be language-aware ([VAD overview](https://developers.openai.com/api/docs/guides/realtime-vad#overview)).

Implementation implication: keep voice-session state in your app layer, then hand off the recognized text to the same orchestrator you use for chat. Do not create a separate voice-only agent graph unless the voice UX truly diverges.

### 4) Put tools where they belong

OpenAI’s tool guidance says that in the Agents SDK, tool semantics stay the same, but wiring moves into agent definitions and workflow design. Attach hosted tools, function tools, or MCP tools directly on the specialist that should use them; expose a specialist as a tool when the manager must stay in control ([Using tools: Usage in the Agents SDK](https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk)).

For MCP:

- Use **hosted MCP tools** when the capability is public/remote and the hosted surface is acceptable.
- Use **SDK-managed MCP servers** when your runtime must own the connection, approvals, and network boundaries ([Integrations and observability: Choose what lives in the SDK](https://developers.openai.com/api/docs/guides/agents/integrations-observability#choose-what-lives-in-the-sdk)).

Implementation implication: keep side-effecting actions behind runtime-owned tools, not hidden in prompts. That makes audit, revocation, and fallback behavior much easier.

### 5) Guardrails and escalation belong next to the risk

Use input guardrails as cheap preflight checks before expensive or side-effecting work. Use blocking execution when the risk of starting the main agent is too high; use parallel guardrails when latency matters more than speculative work ([Guardrails: Add a blocking guardrail](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals#add-a-blocking-guardrail)).

Important boundary: agent-level guardrails do **not** run everywhere. Input guardrails apply only to the first agent in the chain, output guardrails only to the final-output agent, and tool guardrails only on the tool they are attached to. For sensitive actions, validate next to the tool that creates the side effect ([Guardrails: Workflow boundaries matter](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals#workflow-boundaries-matter)).

Implementation implication: for escalation, route to human review from the orchestrator when confidence is low, the topic is high risk, or the action changes state outside the model. Do not rely on a single global safety gate.

### 6) Make tracing and evals part of the product, not an afterthought

Tracing is built into the Agents SDK and is enabled by default on the normal server-side path. Each run can emit model calls, tool calls, handoffs, guardrails, and custom spans, and traces are inspectable in the Traces dashboard ([Tracing](https://developers.openai.com/api/docs/guides/agents/integrations-observability#tracing)).

OpenAI positions traces as the first debugging surface, then evals as the next step once you have representative examples to score ([Evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals), [Tracing](https://developers.openai.com/api/docs/guides/agents/integrations-observability#tracing)).

Implementation implication: capture these metrics from traces and logs:

- handoff rate
- tool success/failure rate
- escalation rate to humans
- voice turn latency
- task completion rate per specialist
- retries and fallback frequency

## Suggested Team of Experts

Use a small, explicit set of specialists rather than a large agent swarm:

- **Triage agent**: classify intent and route to the right expert.
- **Domain expert agents**: one per major job-to-be-done.
- **Safety/review agent**: gate risky requests, sensitive content, or side-effecting actions.
- **Scheduler agent**: turn reminders, follow-ups, and proactive nudges into structured jobs.
- **Analytics agent**: summarize traces, detect friction, and produce weekly product insights.

Recommendation:

- Use **handoff** when a specialist should own the conversation for a while.
- Use **agent-as-tool** when the manager should preserve a single user thread and just collect sub-results.
- Use **structured outputs** for any specialist whose output feeds another machine step.

## Scheduling and Proactive Work

OpenAI does not make scheduling the core abstraction here, so keep scheduling outside the model runtime. Use your app’s scheduler/queue to trigger a new orchestrator run for reminders, weekly summaries, overdue follow-ups, or escalation checks.

Implementation implication: the scheduled job should enter the same agent boundary as a live user turn, so prompts, guardrails, tracing, and analytics stay consistent. This is an architectural inference from OpenAI’s separation of orchestration/state from the transport layer.

## Bottom Line

The best current pattern is:

1. **Orchestrate in the Agents SDK**.
2. **Persist ordinary conversational state with Responses `store: true` when appropriate**.
3. **Use Realtime for the voice transport layer only**.
4. **Keep memory boundaries narrow and explicit**.
5. **Put guardrails next to risk, and use traces as the default analytics surface**.

That gives you a practical way to build a team of domain experts inside one app without turning the system into one giant prompt.
