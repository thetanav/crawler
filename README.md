# Web Crawler

A fast and efficient web crawler built with Bun and TypeScript that can crawl websites and perform Google-like search on the crawled content.

## Features

- 🚀 **Fast crawling** using Bun's high-performance runtime
- 🔍 **Built-in search** functionality to find pages by title
- 📊 **Detailed reporting** with page counts and performance metrics
- 🎯 **Configurable limits** to control crawl depth
- 📁 **JSON export** of crawled data for further analysis
- 🧪 **Comprehensive tests** ensuring reliability

## Installation

Make sure you have [Bun](https://bun.sh/) installed on your system.

```bash
# Clone the repository
git clone https://github.com/thetanav/crawler.git
cd crawler

# Install dependencies
bun install
```

## Usage

### Basic Crawling

Crawl a website and save the results:

```bash
bun run index.ts https://example.com
```

This will crawl up to 100 pages by default and generate:

- `report.json`: Detailed crawl data
- `titles.json`: Title-to-URL mapping

### Crawling with Custom Limit

Limit the number of pages to crawl:

```bash
bun run index.ts https://example.com --limit=50
```

### Crawling and Searching

Crawl a site and immediately search for content:

```bash
bun run index.ts https://example.com "search query"
```

Example output:

```
🔍 Search results for "search query":

────────────────────────────────────────────────────────────

1. Page Title One
   📎 https://example.com/page1
   (Found 5 times)

2. Page Title Two
   📎 https://example.com/page2
   (Found 3 times)

────────────────────────────────────────────────────────────
Total: 2 results
```

## Performance

The crawler is optimized for speed:

- Concurrent page fetching
- Efficient URL normalization
- Minimal memory footprint

Example performance on boot.dev:

```
Time taken 2.34s. Pages found: 87
Pages/sec: 37.18
```

## Development

### Running Tests

```bash
bun test
```

### Building

The project uses TypeScript with Bun's native module resolution.

## Dependencies

- **Bun**: Runtime and package manager
- **TypeScript**: Type safety
- **JSDOM**: HTML parsing and DOM manipulation

## License

This project is private and not licensed for public use.

---

_~~~ Crawled boot.dev ~~~_
