// Unified search: Browse API (active listings) + Claude player intel, run in parallel.
// Sold price history uses a stub until eBay Marketplace Insights API access is approved.
// Returns { market: { sold, soldUnavailable, active, stats, keywords }, intel: PlayerIntel }

export const config = { maxDuration: 45 };

// ─── OAuth2 token cache (module-level, survives warm container reuse) ──────────

let _tokenCache = null; // { token: string, expiresAt: number }

async function getBrowseToken(clientId, clientSecret) {
  const now = Date.now();
  if (_tokenCache && _tokenCache.expiresAt > now + 60_000) {
    return _tokenCache.token; // reuse if more than 1 min of life remains
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`eBay OAuth ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  // Cache for expires_in minus a 5-minute safety buffer
  _tokenCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in - 300) * 1000,
  };
  return _tokenCache.token;
}

// ─── Browse API — active listings ─────────────────────────────────────────────

async function getActiveListings(token, keywords, limit = 20) {
  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  url.searchParams.set("q", keywords);
  url.searchParams.set("category_ids", "212"); // Sports Trading Cards
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort", "price");
  // FIXED_PRICE and auction-with-BIN only (no pure auctions)
  url.searchParams.set("filter", "buyingOptions:{FIXED_PRICE|AUCTION_WITH_BUY_IT_NOW}");

  const res = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[eBay Browse] ${res.status}`, body.slice(0, 300));
    throw new Error(`eBay Browse ${res.status}`);
  }

  const data = await res.json();
  return (data.itemSummaries ?? []).map((it) => ({
    itemId: it.itemId ?? "",
    title: it.title ?? "",
    price: parseFloat(it.price?.value ?? "0") || 0,
    imageUrl: it.image?.imageUrl ?? "",
    url: it.itemWebUrl ?? "",
    date: "",      // Browse API doesn't return listing start time in summary
    condition: it.condition ?? "",
    isAuction: it.buyingOptions?.includes("AUCTION_WITH_BUY_IT_NOW") ?? false,
  }));
}

// ─── Sold price history stub ───────────────────────────────────────────────────
// TODO: replace with eBay Marketplace Insights API once access is approved.
// Endpoint: GET https://api.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search
// Auth: same OAuth2 client-credentials token as Browse API.
// Params: q, category_ids=212, sort=lastSoldDate, limit=25

function getSoldStub() {
  return {
    sold: [],
    soldUnavailable: true, // signals the UI to show "coming soon" instead of "no results"
    stats: { avgSold30d: 0, avgSold90d: 0, highSold: 0, lowSold: 0, totalSold: 0, trend: "flat", trendPct: 0 },
  };
}

// ─── Market data (Browse active + sold stub) ───────────────────────────────────

async function fetchMarketData(clientId, clientSecret, player) {
  const kw = `${player} card`;
  const token = await getBrowseToken(clientId, clientSecret);
  const active = await getActiveListings(token, kw, 20);
  return {
    ...getSoldStub(),
    active,
    keywords: kw,
  };
}

// ─── Claude player intel ───────────────────────────────────────────────────────

async function getPlayerIntel(apiKey, player) {
  const prompt = `Search the web for the most recent news about ${player} as a professional sports player. Find their sport, team, injury status, recent performance, and overall card collector outlook.

Respond ONLY with valid JSON (no markdown):
{
  "player": "${player}",
  "sport": "NFL|NBA|MLB|NHL|WNBA|Unknown",
  "team": "current team or Unknown",
  "status": "active|injured|retired|unknown",
  "hotCold": "hot|warm|neutral|cold|icy",
  "hotColdReason": "one sentence",
  "newsSummary": "2-3 sentence news summary",
  "cardImpact": "strong-buy|buy|hold|sell|strong-sell",
  "cardImpactReason": "one sentence on card value impact",
  "highlights": ["fact 1", "fact 2", "fact 3"],
  "updatedAt": "${new Date().toISOString()}"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json();
  const textBlock = data.content?.findLast?.((b) => b.type === "text");
  if (!textBlock) throw new Error("No text from Claude");
  const clean = textBlock.text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function intelFallback(player) {
  return {
    player,
    sport: "Unknown",
    team: "Unknown",
    status: "unknown",
    hotCold: "neutral",
    hotColdReason: "Unable to fetch latest news",
    newsSummary: "Player intel unavailable — check back shortly.",
    cardImpact: "hold",
    cardImpactReason: "Insufficient data to assess impact",
    highlights: [],
    updatedAt: new Date().toISOString(),
  };
}

// ─── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { q } = req.query;
  if (!q?.trim()) return res.status(400).json({ error: "Missing query parameter: q" });

  const clientId     = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  const apiKey       = process.env.ANTHROPIC_API_KEY;

  console.log("[search] env check →", {
    EBAY_CLIENT_ID:     clientId     ? `set (len=${clientId.length})`     : "MISSING",
    EBAY_CLIENT_SECRET: clientSecret ? `set (len=${clientSecret.length})` : "MISSING",
    ANTHROPIC_API_KEY:  apiKey       ? `set (len=${apiKey.length})`       : "MISSING",
  });

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "EBAY_CLIENT_ID or EBAY_CLIENT_SECRET not configured" });
  }
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const [marketResult, intelResult] = await Promise.allSettled([
    fetchMarketData(clientId, clientSecret, q.trim()),
    getPlayerIntel(apiKey, q.trim()),
  ]);

  const market = marketResult.status === "fulfilled"
    ? marketResult.value
    : { ...getSoldStub(), active: [], keywords: q, error: String(marketResult.reason) };

  const intel = intelResult.status === "fulfilled"
    ? intelResult.value
    : intelFallback(q.trim());

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json({ query: q.trim(), market, intel });
}
