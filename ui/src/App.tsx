import { Search } from "lucide-react";
import { useState } from "react";
import Crawl from "../components/crawl";
import { useQuery } from "@tanstack/react-query";

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

  const { data: crawled, isLoading } = useQuery({
    queryKey: ["crawled"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/done");
      const data = await res.json();
      console.log(data);
      return data.data;
    },
  });

  return (
    <div className="bg-white flex w-screen h-screen">
      <div className="w-[40vw] h-full border-neutral-300 py-4 pl-2 pr-1 flex flex-col items-center justify-start">
        <h2 className="text-2xl font-bold text-center mb-2 ">Crawler</h2>
        <Crawl />
        <ul className="w-full h-fit p-2 border border-neutral-300 rounded-xl mt-2">
          {isLoading && <span className="text-sm">Loading...</span>}
          {crawled &&
            crawled.map((item: any) => (
              <li className="text-sm" key={item.id}>
                {item.url}
              </li>
            ))}
        </ul>
      </div>
      <div className="py-2 flex flex-col gap-2 pl-1 pr-2 h-full w-[60vw]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-3 border border-neutral-300 px-4 py-2 rounded-full items-center justify-center">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search..."
            className="w-full outline-none"
          />
          <button type="submit">
            <Search className="w-5 h-5 text-neutral-500 hover:text-neutral-600 cursor-pointer" />
          </button>
        </form>

        <div className="overflow-y-scroll border border-neutral-300 rounded-xl overflow-x-hidden h-full">
          {result &&
            result.length > 0 &&
            result.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border-b border-neutral-300 last:border-b-0 hover:bg-neutral-50 transition-color -fulls flex items-center gap-2">
                <img
                  src="https://placehold.co/200x200"
                  alt="placeholder"
                  className="h-10 rounded-full"
                />
                <div className="flex flex-col">
                  <h3 className="font-semibold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-600 truncate">
                    {item.url}
                  </p>
                </div>
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}
