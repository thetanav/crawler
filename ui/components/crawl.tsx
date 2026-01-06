import { Bot, CheckCircle2Icon, Loader2 } from "lucide-react";
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
    <div className="flex items-center justify-center px-4 py-2 w-full border border-neutral-300 rounded-full">
      {loading ? (
        <p className="text-md flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          crawling
        </p>
      ) : (
        <>
          {result && result.success ? (
            <p className="text-md text-neutral-500 mt-2 flex items-center justify-center gap-2">
              <CheckCircle2Icon className="w-4" />
              scraped {result.pagesCount} pages in {result.timeTaken}s
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                crawl();
              }}
              className="flex items-center justify-center w-full">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                type="text"
                placeholder="url"
                className="outline-none text-md w-full"
              />
              <button
                type="submit"
                className="text-md text-neutral-600 hover:text-neutral-900 cursor-pointer flex gap-1 items-center justify-center">
                Scrape
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
