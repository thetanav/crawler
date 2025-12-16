import { Search } from "lucide-react";

export default function App() {
  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center relative">
      <h2 className="mb-4 text-4xl font-bold text-center">⚡Crawler⚡</h2>
      <div className="flex gap-3 border border-neutral-400 px-4 py-2 rounded-full w-[60vw]">
        <input
          type="text"
          placeholder="Search..."
          className="w-full outline-none"
        />
        <Search />
      </div>
      <p className="text-xs text-neutral-500 mt-2">
        search all the website and get results instantly
      </p>

      <div className="absolute bottom-6 right-0 left-0 flex items-center justify-center">
        <input
          type="text"
          placeholder="target site url"
          className="outline-none"
        />
        <button className="test-xs text-neutral-600 hover:text-neutral-700 font-bold cursor-pointer">
          scrape
        </button>
      </div>
    </div>
  );
}
