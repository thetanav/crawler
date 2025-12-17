import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";

export default function Crawl() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    pagesCount: number;
    timeTaken: string;
  } | null>(null);

  function crawl() {
    fetch("http://localhost:3000/crawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
      });
  }

  return (
    <div className="absolute bottom-6 right-0 left-0 flex items-center justify-center">
      {result && result.success ? (
        <p className="text-xs text-neutral-500 mt-2 flex items-center justify-center gap-2">
          <CheckCircle2Icon className="w-4" />
          scraped {result.pagesCount} pages in {result.timeTaken}
        </p>
      ) : (
        <>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            type="text"
            placeholder="target site url"
            className="outline-none"
          />
          <button
            onClick={() => crawl()}
            className="test-xs text-neutral-600 hover:text-neutral-700 cursor-pointer">
            scrape
          </button>
        </>
      )}
    </div>
  );
}
