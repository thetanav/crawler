import { JSDOM } from "jsdom";

export function normalizeURL(url: string): string {
  const urlObj = new URL(url);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.endsWith("/")) {
    return hostPath.slice(0, -1);
  }
  return hostPath;
}

export async function getURLsFromHTML(htmlBody: string, baseURL: string) {
  const urls: string[] = [];
  // Ensure baseURL doesn't end with a slash for proper concatenation
  const base = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  await new HTMLRewriter()
    .on("a", {
      element(el) {
        let href = el.getAttribute("href");
        if (href) {
          if (href[0] === "/") {
            if (href.length > 1 && href.endsWith("/")) {
              href = href.slice(0, -1);
            }
            try {
              const urlObj = new URL(href, base);
              urls.push(urlObj.href);
            } catch (e) {}
          } else {
            if (href.length > 1 && href.endsWith("/")) {
              href = href.slice(0, -1);
            }
            try {
              const urlObj = new URL(href);
              urls.push(urlObj.href);
            } catch (e) {}
          }
        }
      },
    })
    .transform(htmlBody);

  return urls;
}

export async function crawlPage(
  baseURL: string,
  currentURL: string,
  pages: any
) {
  const queue = [currentURL];
  while (queue.length > 0) {
    const currentLevel = [...queue];
    queue.length = 0;
    await Promise.all(
      currentLevel.map(async (current) => {
        const baseURLObj = new URL(baseURL);
        const currentURLObj = new URL(current);
        if (baseURLObj.hostname !== currentURLObj.hostname) {
          return;
        }
        const normalizedCurrentURL = normalizeURL(current);
        if (pages[normalizedCurrentURL] > 0) {
          pages[normalizedCurrentURL]++;
          return;
        }
        pages[normalizedCurrentURL] = 1;
        // console.log("Crawling page:", current);
        try {
          const res = await fetch(current);
          if (res.status > 399) {
            console.error("Error fetching page:", res.status, current);
            return;
          }
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("text/html")) {
            console.error("Non-HTML content, skipping:", contentType, current);
            return;
          }
          const htmlBody = await res.text();
          let base = baseURL;
          if (base.length > 1 && base.endsWith("/")) {
            base = base.slice(0, -1);
          }
          const nextUrls = await getURLsFromHTML(htmlBody, base);
          for (const nextUrl of nextUrls) {
            const normalizedNext = normalizeURL(nextUrl);
            if (!pages[normalizedNext]) {
              queue.push(nextUrl);
            }
          }
        } catch (e) {}
      })
    );
  }
  return pages;
}
