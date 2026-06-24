export const config = { maxDuration: 45 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  const { player, grade = "PSA 10", brand = "Prizm", avgSold = 0 } = req.body ?? {};
  if (!player) return res.status(400).json({ error: "Missing: player" });

  const prompt = `You are a sports card investment analyst. Search for recent data on ${player} and then provide a card value prediction.

Card details:
- Player: ${player}
- Brand: ${brand}
- Grade: ${grade}
- Current eBay avg (30-day): ${avgSold > 0 ? "$" + avgSold.toFixed(2) : "unknown"}

Use the eBay avg as your anchor for currentValue if provided. Search for recent performance, news, and comparable sales.

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "currentValue": 0,
  "confidence": "High|Medium|Low",
  "trend": "Bullish|Neutral|Bearish",
  "recommendation": "Buy|Hold|Sell",
  "oneYear":  { "low": 0, "mid": 0, "high": 0 },
  "fiveYear":  { "low": 0, "mid": 0, "high": 0 },
  "tenYear":   { "low": 0, "mid": 0, "high": 0 },
  "lifetime":  { "low": 0, "mid": 0, "high": 0 },
  "reasoning": "2-3 paragraph analysis",
  "bullCase": "1-2 sentences",
  "bearCase": "1-2 sentences",
  "sources": ["source1", "source2"]
}`;

  try {
    const res2 = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(40000),
    });

    const data = await res2.json();
    if (!res2.ok) return res.status(res2.status).json({ error: data.error?.message || "Claude error" });

    const textBlock = data.content?.findLast?.((b) => b.type === "text");
    if (!textBlock) return res.status(500).json({ error: "No prediction from Claude" });

    const clean = textBlock.text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Prediction failed: " + err.message });
  }
}
