import { expect, test } from "bun:test";
import { normalizeURL, getURLsFromHTML } from "../src/crawl";

test("normalizeURL strip protocol", () => {
  const input = "https://blog.tanav.dev/2025";
  const actual = normalizeURL(input);
  const expected = "blog.tanav.dev/2025";
  expect(actual).toEqual(expected);
});

test("normalizeURL strip trailing slash", () => {
  const input = "https://blog.tanav.dev/2025/";
  const actual = normalizeURL(input);
  const expected = "blog.tanav.dev/2025";
  expect(actual).toEqual(expected);
});

test("normalizeURL capitals", () => {
  const input = "https://BLOG.tanav.dev/2025";
  const actual = normalizeURL(input);
  const expected = "blog.tanav.dev/2025";
  expect(actual).toEqual(expected);
});

test("normalizeURL strip http", () => {
  const input = "http://blog.tanav.dev/2025";
  const actual = normalizeURL(input);
  const expected = "blog.tanav.dev/2025";
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML absolute", async () => {
  const inputHTML = `
    <html>
        <body>
            <a href="https://blog.tanav.dev/2025">Blog Post</a>
            <a href="https://external.com/page">External</a>
        </body>
    </html>
  `;
  const inputURL = "https://blog.tanav.dev";
  const actual = await getURLsFromHTML(inputHTML, inputURL);
  const expected = ["blog.tanav.dev/2025", "external.com/page"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML relative", async () => {
  const inputHTML = `
    <html>
        <body>
            <a href="/about">About</a>
            <a href="/contact/">Contact</a>
        </body>
    </html>
  `;
  const inputURL = "https://blog.tanav.dev";
  const actual = await getURLsFromHTML(inputHTML, inputURL);
  const expected = ["blog.tanav.dev/about", "blog.tanav.dev/contact"];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML both", async () => {
  const inputHTML = `
    <html>
        <body>
            <a href="https://blog.tanav.dev/2025">Blog Post</a>
            <a href="https://external.com/page">External</a>
            <a href="/about">About</a>
            <a href="/contact/">Contact</a>
        </body>
    </html>
  `;
  const inputURL = "https://blog.tanav.dev";
  const actual = await getURLsFromHTML(inputHTML, inputURL);
  const expected = [
    "blog.tanav.dev/2025",
    "external.com/page",
    "blog.tanav.dev/about",
    "blog.tanav.dev/contact",
  ];
  expect(actual).toEqual(expected);
});

test("getURLsFromHTML invalid", async () => {
  const inputHTML = `
    <html>
        <body>
            <a href="invalid">Broken Link</a>
        </body>
    </html>
  `;
  const inputURL = "https://blog.tanav.dev";
  const actual = await getURLsFromHTML(inputHTML, inputURL);
  const expected: any = [];
  expect(actual).toEqual(expected);
});
