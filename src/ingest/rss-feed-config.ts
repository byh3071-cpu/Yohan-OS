export type RssFeedDefinition = {
  /** memory/ingest/rss/{feedKey}/ */
  feedKey: string;
  feedUrl: string;
  /** frontmatter source_name */
  sourceName: string;
};

export const RSS_FEED_YOZM: RssFeedDefinition = {
  feedKey: "yozm",
  feedUrl: "https://yozm.wishket.com/magazine/feed/",
  sourceName: "yozm",
};

export const RSS_FEED_AITIMES: RssFeedDefinition = {
  feedKey: "aitimes",
  feedUrl: "https://www.aitimes.com/rss/allArticle.xml",
  sourceName: "aitimes",
};

/** 도메인이 해석되지 않으면(ENOTFOUND) 네트워크·DNS 또는 피드 URL 변경 필요 */
export const RSS_FEED_THEMILK: RssFeedDefinition = {
  feedKey: "themilk",
  feedUrl: "https://www.the-mill.kr/rss",
  sourceName: "themilk",
};

/** paulgraham.com/rss.html 은 HTML 안내 페이지. 공식 페이지가 링크하는 Aaron Swartz 스크랩 RSS 사용. */
export const RSS_FEED_PAULGRAHAM: RssFeedDefinition = {
  feedKey: "paulgraham",
  feedUrl: "http://www.aaronsw.com/2002/feeds/pgessays.rss",
  sourceName: "paulgraham",
};

export const RSS_FEED_SAMALTMAN: RssFeedDefinition = {
  feedKey: "samaltman",
  feedUrl: "https://blog.samaltman.com/posts.atom",
  sourceName: "samaltman",
};

export const RSS_FEED_KARPATHY: RssFeedDefinition = {
  feedKey: "karpathy",
  feedUrl: "https://karpathy.github.io/feed.xml",
  sourceName: "karpathy",
};
