export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  // newsContext is optional — passed when Player Intel data is available
  const { newsContext, ...claudePayload } = req.body;

  // Inject news impact instruction into the last user message
  if (newsContext && claudePayload.messages?.length) {
    const last = claudePayload.messages[claudePayload.messages.length - 1];
    if (last.role === "user") {
      last.content += `

Recent Player News Context:
${newsContext}

Also add a "newsImpact" array to your JSON response with 2-4 items explaining exactly how TODAY'S news affects this card's value. Format each item as a specific, concrete statement like:
- "Scored 40 pts last night → rookie cards typically spike 15–25% after breakout performances"
- "Injury: out 6 weeks → expect 20–30% dip, historically a strong buying window"
Be specific to the actual news, not generic.`;

      // Extend the JSON shape instruction
      last.content = last.content.replace(
        '"keyFactors": ["factor1", "factor2", "factor3"]',
        '"keyFactors": ["factor1", "factor2", "factor3"],\n  "newsImpact": ["news-driven insight 1", "news-driven insight 2"]'
      );
    }
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(claudePayload),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach Claude API" });
  }
}
