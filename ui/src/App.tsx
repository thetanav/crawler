import { Search } from "lucide-react";
import { useState } from "react";
import Crawl from "../components/crawl";

export default function App() {
  const [term, setTerm] = useState("");

  function handleSearch() {
    fetch("http://localhost:3000/search?q=" + term)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center relative">
      <h2 className="mb-5 text-3xl font-bold text-center">⚡Crawler⚡</h2>
      <div className="flex gap-3 border border-neutral-300 px-4 py-2 rounded-full w-[55vw] items-center justify-center">
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
      <p className="text-xs text-neutral-500 mt-2">
        search all the website and get results instantly
      </p>

      <Crawl />
    </div>
  );
}
