export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const prompt = `Search the web for today's sports card market news. Look for:
1. Which player cards are surging in value today or this week (big games, milestones, awards, breakouts)
2. Which player cards are dropping in value (injuries, poor performance, suspensions, retiring)
3. The best buy opportunities right now — undervalued cards based on recent news

Respond ONLY with a JSON object, no other text:
{
  "gainers": [
    {
      "player": "Player Name",
      "card": "e.g. 2021 Prizm Rookie Silver",
      "change": "+35%",
      "reason": "one sentence why",
      "sport": "NBA/NFL/MLB"
    }
  ],
  "losers": [
    {
      "player": "Player Name",
      "card": "e.g. 2020 Bowman Chrome Auto",
      "change": "-22%",
      "reason": "one sentence why",
      "sport": "NBA/NFL/MLB"
    }
  ],
  "buyOpportunities": [
    {
      "player": "Player Name",
      "card": "specific card",
      "reason": "why it's undervalued right now",
      "timeframe": "short-term or long-term buy",
      "sport": "NBA/NFL/MLB"
    }
  ],
  "headline": "one punchy sentence summarizing the market today"
}

Include 3-5 items per category. Use real current data from web searches.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Claude API error" });
    }

    const textBlock = data.content?.findLast?.(b => b.type === "text");
    if (!textBlock) {
      return res.status(500).json({ error: "No text response from Claude" });
    }

    const clean = textBlock.text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    // Cache for 15 minutes via Vercel edge cache header
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=60");
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Market movers failed: " + err.message });
  }
}
