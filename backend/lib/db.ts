import { prisma } from "./prisma";

/**
 * Database service layer providing all crawl-related database operations
 * with proper error handling and logging
 */
export const dbService = {
  /**
   * Find or create a crawled site
   */
  async findOrCreateSite(url: string) {
    return prisma.crawledSite.upsert({
      where: { url },
      update: {},
      create: { url },
    });
  },

  /**
   * Check if a site has already been crawled
   */
  async isSiteCrawled(url: string) {
    const site = await prisma.crawledSite.findUnique({
      where: { url },
    });
    return !!site;
  },

  /**
   * Check if a page has already been crawled
   */
  async isPageCrawled(url: string) {
    const page = await prisma.crawledPage.findUnique({
      where: { url },
    });
    return !!page;
  },

  /**
   * Create or skip a crawled page
   */
  async createPageIfNotExists(data: {
    url: string;
    siteUrl: string;
    title: string;
  }) {
    try {
      const existing = await prisma.crawledPage.findUnique({
        where: { url: data.url },
      });

      if (existing) {
        return null;
      }

      return await prisma.crawledPage.create({
        data,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Search pages by title with pagination
   */
  async searchPages(query: string, skip: number, take: number) {
    return prisma.crawledPage.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Count search results
   */
  async countSearchResults(query: string) {
    return prisma.crawledPage.count({
      where: {
        title: {
          contains: query,
        },
      },
    });
  },

  /**
   * Get all crawled sites
   */
  async getAllCrawledSites() {
    return prisma.crawledSite.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Get pages for a specific site
   */
  async getSitePages(siteUrl: string) {
    return prisma.crawledPage.findMany({
      where: { siteUrl },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Get count of pages for a site
   */
  async getSitePageCount(siteUrl: string) {
    return prisma.crawledPage.count({
      where: { siteUrl },
    });
  },

  /**
   * Delete a site and cascade delete its pages
   */
  async deleteSite(url: string) {
    return prisma.crawledSite.delete({
      where: { url },
    });
  },

  /**
   * Batch create pages (more efficient than individual creates)
   */
  async createPagesInBatch(
    pages: Array<{
      url: string;
      siteUrl: string;
      title: string;
    }>
  ) {
    return Promise.all(
      pages.map((page) => this.createPageIfNotExists(page))
    );
  },
};
