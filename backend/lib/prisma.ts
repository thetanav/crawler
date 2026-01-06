import Database from "bun:sqlite";

const db = new Database("dev.db", { create: true });

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

const prisma = {
  crawledSite: {
    findUnique: async (args: { where: { url: string } }): Promise<CrawledSite | null> => {
      const result = db.query("SELECT * FROM crawled_sites WHERE url = ?").get(args.where.url) as CrawledSite | undefined;
      return result || null;
    },
    create: async (args: { data: { url: string } }): Promise<CrawledSite> => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      db.query("INSERT INTO crawled_sites (id, url, created_at, updated_at) VALUES (?, ?, ?, ?)").run(
        id,
        args.data.url,
        now,
        now
      );
      return { id, url: args.data.url, created_at: now, updated_at: now };
    },
    findMany: async (): Promise<CrawledSite[]> => {
      return db.query("SELECT * FROM crawled_sites").all() as CrawledSite[];
    },
  },
  crawledPage: {
    findUnique: async (args: { where: { url: string } }): Promise<CrawledPage | null> => {
      const result = db.query("SELECT * FROM crawled_pages WHERE url = ?").get(args.where.url) as CrawledPage | undefined;
      return result || null;
    },
    create: async (args: { data: { url: string; siteUrl: string; title: string } }): Promise<CrawledPage> => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      db.query("INSERT INTO crawled_pages (id, url, site_url, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").run(
        id,
        args.data.url,
        args.data.siteUrl,
        args.data.title,
        now,
        now
      );
      return { id, url: args.data.url, site_url: args.data.siteUrl, title: args.data.title, created_at: now, updated_at: now };
    },
    findMany: async (args?: { where?: { OR?: Array<{ url?: { contains: string }; title?: { contains: string } }> } }): Promise<CrawledPage[]> => {
      if (!args?.where?.OR) {
        return db.query("SELECT * FROM crawled_pages").all() as CrawledPage[];
      }
      
      const conditions = args.where.OR
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
  $disconnect: async () => {
    db.close();
  },
};

export { prisma };
