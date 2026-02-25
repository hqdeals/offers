const fs = require("fs");
const { parseString } = require("xml2js");

// Get arguments from command line
const inputFile = process.argv[2];
const outputFile = process.argv[3];

const xmlContent = fs.readFileSync(inputFile, "utf-8");

parseString(xmlContent, (err, result) => {
  if (err) {
    console.error(`Error parsing ${inputFile}:`, err);
    return;
  }

  const items = result.rss?.channel?.[0]?.item || [];

  const allOffers = items.map((item) => {
    let title = item.title?.[0] || "";
    const link = item.link?.[0] || "";
    const priceMatch = title.match(
      /down ([\d.]+)% \(([\d.,]+)€\) to ([\d.,]+)€ from ([\d.,]+)€/,
    );

    title = title.split(" - down ")[0]
    if (title.indexOf("...") !== -1) {
      title = title.split("...")[0]
    }

    return {
      title: title,
      asin: link.replace("https://de.camelcamelcamel.com/product/", ""),
      date: item.pubDate?.[0] || "",
      note: 4.5,
      price: {
        current: priceMatch ? Number(priceMatch[3].replace(",", ".")) : 0,
        original: priceMatch ?  Number(priceMatch[4].replace(",", ".")) : 0,
      },
      discount: {
        amount: priceMatch ? Number(priceMatch[2].replace(",", ".")) : 0,
        percentage: priceMatch ? Number(priceMatch[1].replace(",", ".")) : 0,
      },
      image: "https://m.media-amazon.com/images/I/31ap1YeV6tL._AC_SL1001_.jpg",
      link: {
        href: link.replace("https://de.camelcamelcamel.com/product/", "https://www.amazon.de/dp/"),
        rel: "Amazon"
      }
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(allOffers, null, 2));
  console.log(
    `Generated ${outputFile} with ${Object.keys(allOffers).length} categories`,
  );
});
