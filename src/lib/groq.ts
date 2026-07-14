/**
 * Groq LLM integration for AI-generated weekly reports.
 *
 * Called from the reports API/action when the user requests a summary of
 * recently completed tasks. Uses the OpenAI-compatible Groq endpoint so the
 * same client library works with Groq's hosted models (default: Llama 3.1).
 */

/** Minimal task shape sent to the model — keeps prompts small and focused. */
export type CompletedTaskSummary = {
  title: string
  project: string
  assignee: string
}

/**
 * Generate a bullet-point weekly summary from completed tasks.
 * Requires GROQ_API_KEY; optional GROQ_MODEL overrides the default model.
 */
export async function generateWeeklySummary(tasks: CompletedTaskSummary[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("Groq API not configured. Set GROQ_API_KEY in .env")
  }

  // Dynamic import keeps the OpenAI SDK out of the initial bundle when unused.
  const { default: OpenAI } = await import("openai")

  // Groq exposes an OpenAI-compatible REST API at a different base URL.
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  })

  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant"

  const response = await client.chat.completions.create({
    model,
    temperature: 0.4, // Low creativity — summaries should stay factual
    messages: [
      {
        role: "system",
        content:
          "You summarize completed work for a digital agency team. Reply in English with a professional tone. Use 3–5 bullet points based ONLY on the provided tasks — do not invent tasks or add generic filler. Each bullet must start with '- '. Mention project names where helpful. No intro or outro.",
      },
      {
        role: "user",
        content: `Summarize these completed tasks from the last 7 days:\n${JSON.stringify(tasks, null, 2)}`,
      },
    ],
  })

  const content = response.choices[0]?.message?.content?.trim()
  if (!content) {
    throw new Error("Groq returned an empty response.")
  }

  return content
}
