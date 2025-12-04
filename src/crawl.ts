import { JSDOM } from "jsdom";

export function normalizeURL(url: string): string {
  const urlObj = new URL(url);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.endsWith("/")) {
    return hostPath.slice(0, -1);
  }
  return hostPath;
}

export function getURLsFromHTML(htmlBody: string, baseURL: string): string[] {
  const urls: string[] = [];
  const dom = new JSDOM(htmlBody);
  const anchorElements = dom.window.document.querySelectorAll("a");
  for (const anchorElement of anchorElements) {
    if (anchorElement.href.slice(0, 1) === "/") {
      try {
        const urlObj = new URL(`${baseURL}${anchorElement.href}`);
        urls.push(urlObj.href);
      } catch (e) {}
    } else {
      try {
        const urlObj = new URL(anchorElement.href);
        urls.push(urlObj.href);
      } catch (e) {}
    }
  }
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
  console.log("Crawling page:", currentURL);
  try {
    const res = await fetch(currentURL);
    if (res.status > 399) {
      return pages;
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      return pages;
    }
    const htmlBody = await res.text();
    const nextUrls = getURLsFromHTML(htmlBody, baseURL);
    for (const nextUrl of nextUrls) {
      pages = await crawlPage(baseURL, nextUrl, pages);
    }
  } catch (e) {}
  return pages;
}
