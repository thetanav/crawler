# Web Crawler

![screenrecording-2025-12-05_20-19-44-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/9da7b9b3-c11f-4041-9df1-a050641c3596)

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

## Searching Crawled Data

Start the web server to access the minimal, Google-inspired search interface:

```bash
bun run server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Features

**Home Page:**
- Clean, minimalist design
- Quick search box
- One-click site crawl button
- Instant feedback on crawl status

**Search Results:**
- Fast, real-time search results
- Google-like result cards with titles, URLs, and snippets
- Clickable links to visit found pages
- Mention count for relevance
- Mobile-responsive design

**Live Crawling:**
- Enter any website URL
- Crawl up to 100 pages instantly
- Results available immediately for searching
### 2. Command Line Search

Search previously crawled data from the command line:

```bash
bun search.ts "your search query"
```

This requires that you have already run the crawler to generate `report.json`.

## Design Philosophy

The web UI is designed with simplicity in mind - inspired by Google's minimalist search interface:

- **Clean & Fast** - No clutter, just search and results
- **Intuitive** - Instantly familiar to anyone who's used a search engine
- **Mobile-First** - Responsive design works great on any device
- **Minimal Dependencies** - Built with Vite + React for blazing-fast performance

## Development

### Building the UI

To rebuild the Vite app after making changes:

```bash
bun run ui:build
```

### Developing the UI

To run the Vite dev server with hot reloading:

```bash
bun run ui:dev
```

Then access it at [http://localhost:5173](http://localhost:5173)

### How the Web UI Works

The web UI is built with **Vite + React** and communicates with the backend server via two APIs:

1. **POST /api/crawl** - Starts a new crawl
   - Sends domain URL and page limit
   - Returns success/error status and page count
   
2. **GET /api/search** - Searches crawled pages
   - Sends search query as URL parameter
   - Returns matching pages sorted by relevance

The server automatically caches crawled data in memory, so subsequent searches are instant.


## Dependencies

- **Bun**: Runtime and package manager
- **TypeScript**: Type safety
- **JSDOM**: HTML parsing and DOM manipulation
- **React**: UI framework
- **Vite**: Build tool and dev server

## License

This project is private and not licensed for public use.

---

_~~~ Crawled boot.dev ~~~_
