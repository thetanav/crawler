import { crawlPage } from "./src/crawl";

function main() {
  const args = Bun.argv.slice(2);

  if (args.length < 1) {
    console.error("Please provide a URL as an argument");
    return;
  }
  if (args.length > 1) {
    console.error("Too many arguments provided");
    return;
  }

  let baseURL = args[0] as string;
  console.log("Starting crawl of", baseURL);

  crawlPage(baseURL, baseURL, {}).then((pages) => {
    console.log("Crawl complete. Pages found:");
    console.log(pages);
  });
}

main();
