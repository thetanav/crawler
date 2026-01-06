import { Search } from "lucide-react";
import { useState } from "react";
import Crawl from "../components/crawl";

export default function App() {
  const [term, setTerm] = useState("");
  const [result, setResult] = useState<
    | {
        id: string;
        url: string;
        title: string;
        siteUrl: string;
        createdAt: string;
      }[]
    | null
  >(null);
  function handleSearch() {
    fetch("http://localhost:3000/search?q=" + term)
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
      });
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-start pt-4 relative">
      <div className="flex gap-6 items-center justify-center">
        <h2 className="text-2xl font-bold text-center">Crawler</h2>
        <div className="flex gap-3 border border-neutral-300 px-4 py-2 rounded-full w-[55vw] items-center justify-center shadow">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search..."
            className="w-full outline-none"
          />
          <button onClick={() => handleSearch()}>
            <Search className="w-5 h-5 text-neutral-500 hover:text-neutral-600 cursor-pointer" />
          </button>
        </div>
      </div>

      {result && result.length > 0 && (
        <div className="w-[55vw] mt-6">
          <div className="border border-neutral-300 rounded-lg overflow-hidden">
            {result.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border-b border-neutral-300 last:border-b-0 hover:bg-neutral-50 transition-colors">
                <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                <p className="text-sm text-neutral-600 truncate">{item.url}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      <Crawl />
    </div>
  );
}
