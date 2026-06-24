// Unified search: runs eBay (sold + active) and Claude player intel in parallel.
// Returns { market: { sold, active, stats, keywords, error? }, intel: PlayerIntel }

export const config = { maxDuration: 45 };

const EBAY_ENDPOINT = "https://svcs.ebay.com/services/search/FindingService/v1";
const CARD_CATEGORY = "212";

function safeFloat(v) {
  const n = parseFloat(String(v ?? "0"));
  return isNaN(n) ? 0 : n;
}

function parseItems(data, opKey) {
  try {
    const resp = data[opKey]?.[0];
    if (!resp) return [];
    const ack = resp.ack?.[0];
    if (ack !== "Success" && ack !== "Warning") return [];
    const items = resp.searchResult?.[0]?.item ?? [];
    return items.map((it) => ({
      itemId: it.itemId?.[0] ?? "",
      title: it.title?.[0] ?? "",
      price: safeFloat(
        it.sellingStatus?.[0]?.convertedCurrentPrice?.[0]?.__value__ ??
        it.sellingStatus?.[0]?.currentPrice?.[0]?.__value__
      ),
      imageUrl: (it.galleryURL?.[0] ?? "").replace("s-l140", "s-l400"),
      url: it.viewItemURL?.[0] ?? "",
      date: it.listingInfo?.[0]?.endTime?.[0] ?? it.listingInfo?.[0]?.startTime?.[0] ?? "",
      condition: it.condition?.[0]?.conditionDisplayName?.[0] ?? "",
      isAuction: it.listingInfo?.[0]?.listingType?.[0] === "Auction",
    }));
  } catch {
    return [];
  }
}

async function ebayGet(appId, operation, extra) {
  const url = new URL(EBAY_ENDPOINT);
  const base = {
    "OPERATION-NAME": operation,
    "SERVICE-VERSION": "1.13.0",
    "SECURITY-APPNAME": appId,
    "RESPONSE-DATA-FORMAT": "JSON",
    "REST-PAYLOAD": "",
  };
  for (const [k, v] of Object.entries({ ...base, ...extra })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`eBay ${res.status}`);
  return res.json();
}

function calcStats(sold) {
  const prices = sold.map((s) => s.price).filter((p) => p > 0);
  if (!prices.length) {
    return { avgSold30d: 0, avgSold90d: 0, highSold: 0, lowSold: 0, totalSold: 0, trend: "flat", trendPct: 0 };
  }
  const now = Date.now();
  const ago30 = now - 30 * 86400_000;
  const ago60 = now - 60 * 86400_000;
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const p30 = sold.filter((s) => new Date(s.date).getTime() > ago30).map((s) => s.price).filter(Boolean);
  const p60 = sold.filter((s) => { const t = new Date(s.date).getTime(); return t > ago60 && t <= ago30; }).map((s) => s.price).filter(Boolean);
  const avg30 = avg(p30);
  const avgPrev = avg(p60);
  const trendPct = avgPrev > 0 && avg30 > 0 ? ((avg30 - avgPrev) / avgPrev) * 100 : 0;
  return {
    avgSold30d: avg30,
    avgSold90d: avg(prices),
    highSold: Math.max(...prices),
    lowSold: Math.min(...prices),
    totalSold: sold.length,
    trend: trendPct > 2 ? "up" : trendPct < -2 ? "down" : "flat",
    trendPct,
  };
}

async function fetchMarketData(appId, player) {
  const kw = `${player} card`;
  const [soldResult, activeResult] = await Promise.allSettled([
    ebayGet(appId, "findCompletedItems", {
      keywords: kw,
      categoryId: CARD_CATEGORY,
      "itemFilter(0).name": "SoldItemsOnly",
      "itemFilter(0).value": "true",
      "itemFilter(1).name": "ListingType",
      "itemFilter(1).value(0)": "Auction",
      "itemFilter(1).value(1)": "AuctionWithBIN",
      "itemFilter(1).value(2)": "FixedPrice",
      "sortOrder": "EndTimeSoonest",
      "paginationInput.entriesPerPage": "50",
      "outputSelector(0)": "SellerInfo",
      "outputSelector(1)": "GalleryInfo",
    }).then((d) => parseItems(d, "findCompletedItemsResponse")),
    // TODO: migrate active listings to Browse API
    ebayGet(appId, "findItemsAdvanced", {
      keywords: kw,
      categoryId: CARD_CATEGORY,
      "itemFilter(0).name": "ListingType",
      "itemFilter(0).value(0)": "FixedPrice",
      "itemFilter(0).value(1)": "AuctionWithBIN",
      "sortOrder": "PricePlusShippingLowest",
      "paginationInput.entriesPerPage": "20",
      "outputSelector(0)": "SellerInfo",
      "outputSelector(1)": "GalleryInfo",
    }).then((d) => parseItems(d, "findItemsAdvancedResponse")),
  ]);
  const sold = soldResult.status === "fulfilled" ? soldResult.value : [];
  const active = activeResult.status === "fulfilled" ? activeResult.value : [];
  return {
    sold: sold.slice(0, 25),
    active,
    stats: calcStats(sold),
    keywords: kw,
    error: soldResult.status === "rejected" ? String(soldResult.reason) : undefined,
  };
}

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

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { q } = req.query;
  if (!q?.trim()) return res.status(400).json({ error: "Missing query parameter: q" });

  const appId = process.env.EBAY_APP_ID;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!appId) return res.status(500).json({ error: "EBAY_APP_ID not configured" });
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  const [marketResult, intelResult] = await Promise.allSettled([
    fetchMarketData(appId, q.trim()),
    getPlayerIntel(apiKey, q.trim()),
  ]);

  const market = marketResult.status === "fulfilled"
    ? marketResult.value
    : { sold: [], active: [], stats: { avgSold30d: 0, avgSold90d: 0, highSold: 0, lowSold: 0, totalSold: 0, trend: "flat", trendPct: 0 }, keywords: q, error: String(marketResult.reason) };

  const intel = intelResult.status === "fulfilled"
    ? intelResult.value
    : intelFallback(q.trim());

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json({ query: q.trim(), market, intel });
}
