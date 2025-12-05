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
              const urlObj = new URL(`${baseURL}${href}`);
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
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);
  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }
  const normalizedCurrentURL = normalizeURL(currentURL);
  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL]++;
    return pages;
  }
  pages[normalizedCurrentURL] = 1;
  // console.log("Crawling page:", currentURL);
  try {
    const res = await fetch(currentURL);
    if (res.status > 399) {
      console.error("Error fetching page:", res.status, currentURL);
      return pages;
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      console.error("Non-HTML content, skipping:", contentType, currentURL);
      return pages;
    }
    const htmlBody = await res.text();
    if (baseURL.length > 1 && baseURL.endsWith("/")) {
      baseURL = baseURL.slice(0, -1);
    }
    const nextUrls = await getURLsFromHTML(htmlBody, baseURL);
    await Promise.all(
      nextUrls.map((nextUrl) => crawlPage(baseURL, nextUrl, pages))
    );
  } catch (e) {}
  return pages;
}
