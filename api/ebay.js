export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const appId = process.env.EBAY_APP_ID;
  if (!appId) {
    return res.status(500).json({ error: "EBAY_APP_ID not configured" });
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Missing query parameter: q" });
  }

  const params = new URLSearchParams({
    "OPERATION-NAME": "findCompletedItems",
    "SERVICE-VERSION": "1.0.0",
    "SECURITY-APPNAME": appId,
    "RESPONSE-DATA-FORMAT": "JSON",
    "keywords": `${q} sports card`,
    "categoryId": "212",
    "itemFilter(0).name": "SoldItemsOnly",
    "itemFilter(0).value": "true",
    "outputSelector(0)": "PictureURLLarge",
    "outputSelector(1)": "PictureURLSuperSize",
    "sortOrder": "EndTimeSoonest",
    "paginationInput.entriesPerPage": "24",
  });

  try {
    const response = await fetch(
      `https://svcs.ebay.com/services/search/FindingService/v1?${params}`
    );
    const data = await response.json();

    const searchResult =
      data?.findCompletedItemsResponse?.[0]?.searchResult?.[0];
    const rawItems = searchResult?.item || [];

    const items = rawItems.map((item) => {
      const price = parseFloat(
        item.sellingStatus?.[0]?.convertedCurrentPrice?.[0]?.["__value__"] || 0
      );
      const image =
        item.pictureURLSuperSize?.[0] ||
        item.pictureURLLarge?.[0] ||
        item.galleryURL?.[0] ||
        null;
      return {
        id: item.itemId?.[0],
        title: item.title?.[0],
        price,
        url: item.viewItemURL?.[0],
        image,
        endTime: item.listingInfo?.[0]?.endTime?.[0],
      };
    });

    const prices = items.map((i) => i.price).filter((p) => p > 0);
    const avg = prices.length
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    const count = prices.length;

    // Heat level: fire (>30 sales or max >> 2× avg), hot (15-30), warm (5-14), cold (<5)
    let heat;
    if (count >= 20 || (max > avg * 2.5 && count >= 10)) heat = "fire";
    else if (count >= 12) heat = "hot";
    else if (count >= 5) heat = "warm";
    else heat = "cold";

    return res.status(200).json({ items, avg, count, heat });
  } catch (err) {
    return res.status(500).json({ error: "eBay search failed: " + err.message });
  }
}
