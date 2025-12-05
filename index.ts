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

  const startTime = performance.now();
  crawlPage(baseURL, baseURL, {}).then((pages) => {
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000;
    console.log("\n################################");
    console.log(
      `Time taken ${timeTaken.toFixed(2)}s. Pages found: ${
        Object.keys(pages).length
      }`
    );
    console.log(
      "Pages/sec:",
      (Object.keys(pages).length / timeTaken).toFixed(2)
    );
    // console.log(pages);
    console.log("report saved to report.json");
    console.log("################################");
    Bun.write("report.json", JSON.stringify(pages, null, 2));
  });
}

main();
