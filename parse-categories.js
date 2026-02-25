import fs from "fs";
import { JSDOM } from "jsdom";

async function parseCategories(input) {
  const response = await fetch(input, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  if (response.status !== 200) {
    throw new Error(`Error fetching ${input}: ${response.statusText}`);
  }
  const html = await response.text();
  const dom = new JSDOM(html);
  const selectElement = dom.window.document.getElementById("bn");

  if (!selectElement) {
    throw new Error('Select element with id "bn" not found');
  }

  const options = Array.from(selectElement.querySelectorAll("option"));
  return options
    .filter((option) => {
      return option.value !== "";
    })
    .map((option) => ({
      value: option.value,
      text: option.textContent,
    }))
    .slice(0, 5);
}

const now = new Date();
const timestamp = now.getTime();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const hours = String(now.getHours()).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");
const categories = {
  timestamp: timestamp, 
  dir: `${year}/${month}/${day}/${hours}/${minutes}`, 
  categories: await parseCategories(process.argv[2])
};
fs.writeFileSync(process.argv[3], JSON.stringify(categories, null, 2));
console.log(JSON.stringify(categories));
