import { prisma } from "../lib/prisma";

export interface PageInfo {
  url: string;
  title: string;
  count: number;
}

export interface SearchIndex {
  [normalizedUrl: string]: PageInfo;
}

export function normalizeURL(url: string): string {
  const urlObj = new URL(url);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.endsWith("/")) {
    return hostPath.slice(0, -1);
  }
  return hostPath;
}

export async function getPageTitle(htmlBody: string): Promise<string> {
  let title = "";
  new HTMLRewriter()
    .on("title", {
      text(text) {
        title += text.text;
      },
    })
    .transform(htmlBody);
  return title.trim() || "Untitled";
}

export async function getURLsFromHTML(htmlBody: string, baseURL: string) {
  const urls: string[] = [];
  // Ensure baseURL doesn't end with a slash for proper concatenation
  const base = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  new HTMLRewriter()
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
  pages: SearchIndex,
  limit: number = 100
): Promise<SearchIndex> {
  const queue = [currentURL];

  while (queue.length > 0 && Object.keys(pages).length < limit) {
    const currentLevel = [...queue];
    queue.length = 0;
    await Promise.all(
      currentLevel.map(async (current) => {
        if (Object.keys(pages).length >= limit) {
          return;
        }
        const baseURLObj = new URL(baseURL);
        const currentURLObj = new URL(current);
        if (baseURLObj.hostname !== currentURLObj.hostname) {
          return;
        }
        const normalizedCurrentURL = normalizeURL(current);
        if (pages[normalizedCurrentURL]) {
          pages[normalizedCurrentURL].count++;
          return;
        }
        try {
          const res = await fetch(current);
          if (res.status > 399) {
            return;
          }
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("text/html")) {
            return;
          }
          const htmlBody = await res.text();
          const title = await getPageTitle(htmlBody);

          pages[normalizedCurrentURL] = {
            url: current,
            title: title,
            count: 1,
          };

          await prisma.crawledPage.create({
            data: {
              url: current,
              siteUrl: baseURL,
              title: title,
            },
          });

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
