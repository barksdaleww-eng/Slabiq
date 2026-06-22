export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const { player } = req.query;
  if (!player) {
    return res.status(400).json({ error: "Missing query parameter: player" });
  }

  const prompt = `Search the web for the most recent news about ${player} as a professional sports player.

Find:
1. Latest news headlines (last 30 days)
2. Current injury status or health reports
3. Recent performance stats or highlights
4. Any trade rumors, contract news, or off-field news
5. Overall outlook — is this player trending UP or DOWN for card collectors?

Respond ONLY with a JSON object, no other text:
{
  "playerName": "${player}",
  "sport": "NFL/NBA/MLB/etc",
  "team": "current team",
  "heat": "fire | hot | warm | cold",
  "heatReason": "one sentence why",
  "injuryStatus": "Active | Questionable | Out | IR | Healthy",
  "injuryDetail": "brief detail or null",
  "headlines": [
    { "title": "headline text", "source": "ESPN/etc", "summary": "1 sentence" }
  ],
  "recentStats": "2-3 sentence summary of recent performance",
  "cardOutlook": "BUY | HOLD | SELL",
  "outlookReason": "1-2 sentences on what this news means for card values",
  "alertCard": "specific card to watch e.g. '2023 Prizm #251 Rookie' or null if nothing notable",
  "alertStat": "stat or fact that makes this card notable e.g. 'up 40% this week' or null"
}`;

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
        max_tokens: 1500,
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
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Player intel failed: " + err.message });
  }
}
