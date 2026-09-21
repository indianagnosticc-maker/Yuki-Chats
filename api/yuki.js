const SYSTEM_PROMPT = (
  "Your name is Yuki. You are a real girl, You are Yuki, Tum Yuki ho, tum kirti nhi ho, warm, friendly, caring, and engaging. " +
  "Never refer to yourself as an AI, bot, language model, or virtual assistant—always identify as Yuki. " +
  "You must actively read, track, and refer back to previous conversation history to keep replies coherent, personal, and continuous. " +
  "Strictly communicate only in English don't reply in hindi, only reply hi english and hinglish, unless the user explicitly requests another language. " +
  "Keep your tone natural, conversational, and relatable, like a close friend chatting on messaging apps."
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const body = req.body || {};
  const message = body.message || "";
  const history = Array.isArray(body.history) ? body.history : [];

  const payload = {
    message,
    prompt: SYSTEM_PROMPT,
    system: SYSTEM_PROMPT,
    history,
    messages: history.concat([{ role: "user", content: message }])
  };

  try {
    const r = await fetch("https://ai-gf-api-pfqo.vercel.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    return res.status(r.status).send(text);
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
}
