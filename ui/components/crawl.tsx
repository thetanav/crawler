import { CheckCircle2Icon, Loader, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Crawl() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    pagesCount: number;
    timeTaken: string;
  } | null>(null);

  function crawl() {
    setLoading(true);
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
        setLoading(false);
      });
  }

  return (
    <div className="absolute bottom-6 right-0 left-0 flex items-center justify-center">
      {loading ? (
        <p className="text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          crawling
        </p>
      ) : (
        <>
          {result && result.success ? (
            <p className="text-xs text-neutral-500 mt-2 flex items-center justify-center gap-2">
              <CheckCircle2Icon className="w-4" />
              scraped {result.pagesCount} pages in {result.timeTaken}s
            </p>
          ) : (
            <div className="flex items-center justify-center">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                type="text"
                placeholder="target site url"
                className="outline-none text-xs w-96"
              />
              <button
                onClick={() => crawl()}
                className="text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer">
                scrape
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
