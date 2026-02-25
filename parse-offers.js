import fs from "fs";
import { parseString } from "xml2js";

// Convert number format (1.234,56) to JavaScript number
function parseFormattedNumber(str) {
  return parseNumber(str.replace(".", "").replace(",", "."));
}

function parseNumber(str) {
  const num = Number(str);
  if (isNaN(num)) {
    throw new Error(`Error parsing number from string: ${str}`, {
      cause: error,
    });
  }
  return num;
}

const offersURL = process.argv[2];
const category = process.argv[3];
const outputFile = process.argv[4];

const response = await fetch(
  `${offersURL}/feed?bn=${category}&d=1&i=7&s=relative&t=recent`,
);
if (response.status !== 200) {
  throw new Error(`Error fetching offers: ${response.statusText}`);
}
const xmlContent = await response.text();

parseString(xmlContent, (err, result) => {
  if (err) {
    throw new Error(`Error parsing ${category}:`, xmlContent, err);
  }

  const items = result.rss?.channel?.[0]?.item || [];

  const offers = items.map((item) => {
    let title = item.title?.[0] || "";
    const link = item.link?.[0] || "";
    const priceMatch = title.match(
      /down ([\d.,]+)% \(([\d.,]+)€\) to ([\d.,]+)€ from ([\d.,]+)€/,
    );
    if (!priceMatch || priceMatch.length != 5) {
      throw new Error(`Price information not found in title: ${title}`);
    }

    title = title.split(" - down ")[0];
    if (title.indexOf("...") !== -1) {
      title = title.split("...")[0];
    }
    if (title.length > 50) {
      title = title.substring(0, 50);
    }

    const asin = link.split('/').pop();

    return {
      title: title,
      asin: asin,
      reviews: {
        rating: 4 + (Math.random()),
        count: 1000 +  + Math.floor((Math.random()) * 1000),
      },
      price: {
        current: parseFormattedNumber(priceMatch[3]),
        original: parseFormattedNumber(priceMatch[4]),
      },
      image: `https://images-na.ssl-images-amazon.com/images/P/${asin}.jpg`,
      link: {
        href: `https://www.amazon.de/dp/${asin}`,
        rel: "Amazon",
      },
    };
  });

  
  fs.writeFileSync(outputFile, JSON.stringify(offers, null, 2));
});
