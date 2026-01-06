import Database from "bun:sqlite";

const db = new Database("dev.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS crawled_sites (
    id TEXT PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS crawled_pages (
    id TEXT PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    site_url TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export interface CrawledSite {
  id: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface CrawledPage {
  id: string;
  url: string;
  site_url: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const dbQueries = {
  crawledSite: {
    findUnique: (url: string): CrawledSite | null => {
      const result = db.query("SELECT * FROM crawled_sites WHERE url = ?").get(url) as CrawledSite | undefined;
      return result || null;
    },
    create: (data: { id: string; url: string }): void => {
      const now = new Date().toISOString();
      db.query("INSERT INTO crawled_sites (id, url, created_at, updated_at) VALUES (?, ?, ?, ?)").run(
        data.id,
        data.url,
        now,
        now
      );
    },
    findMany: (): CrawledSite[] => {
      return db.query("SELECT * FROM crawled_sites").all() as CrawledSite[];
    },
  },
  crawledPage: {
    create: (data: { id: string; url: string; site_url: string; title: string }): void => {
      const now = new Date().toISOString();
      db.query("INSERT INTO crawled_pages (id, url, site_url, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").run(
        data.id,
        data.url,
        data.site_url,
        data.title,
        now,
        now
      );
    },
    findMany: (where?: { OR?: Array<{ url?: { contains: string }; title?: { contains: string } }> }): CrawledPage[] => {
      if (!where || !where.OR) {
        return db.query("SELECT * FROM crawled_pages").all() as CrawledPage[];
      }
      
      const conditions = where.OR
        .map((condition) => {
          const urlCondition = condition.url?.contains ? `url LIKE '%${condition.url.contains}%'` : "";
          const titleCondition = condition.title?.contains ? `title LIKE '%${condition.title.contains}%'` : "";
          return [urlCondition, titleCondition].filter(Boolean).join(" OR ");
        })
        .filter(Boolean)
        .map(c => `(${c})`)
        .join(" OR ");
      
      if (!conditions) {
        return db.query("SELECT * FROM crawled_pages").all() as CrawledPage[];
      }
      
      const query = `SELECT * FROM crawled_pages WHERE ${conditions}`;
      return db.query(query).all() as CrawledPage[];
    },
  },
};

export { db };
