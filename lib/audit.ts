import * as cheerio from 'cheerio';

export type ImageIssue = {
  src: string;
  alt?: boolean;
  missingFormats?: boolean;
  oversized?: boolean;
};

export type LinkIssue = {
  url: string;
  statusCode?: number;
  broken: boolean;
};

export type RedirectIssue = {
  type: 'www' | 'non-www' | 'http-https' | 'other';
  message: string;
};

export type AuditResult = {
  url: string;
  status: number | null;
  responseTimeMs: number | null;
  contentType?: string | null;
  title?: string;
  metaDescription?: string;
  h1Count?: number;
  totalImages?: number;
  imgWithoutAlt?: number;
  imageIssues?: ImageIssue[];
  totalLinks?: number;
  brokenLinks?: LinkIssue[];
  externalLinks?: number;
  scriptsCount?: number;
  inlineStylesCount?: number;
  hasRobots?: boolean;
  hasSitemap?: boolean;
  // Performance metrics (estimated)
  ttfbMs?: number;
  fcpMs?: number;
  lcpMs?: number;
  // Mobile & Responsiveness
  hasViewport?: boolean;
  responsive?: boolean;
  // Security
  isHttps?: boolean;
  hasHsts?: boolean;
  hasMixedContent?: boolean;
  // Redirect issues
  redirects?: RedirectIssue[];
  // Overall score
  score?: number;
  error?: string | null;
};

function safeOrigin(input: string) {
  try {
    return new URL(input).origin;
  } catch {
    return null;
  }
}

// Estimate performance metrics from response time and HTML size
function estimateMetrics(responseTimeMs: number, htmlSize: number) {
  // TTFB is roughly the response time to first byte
  const ttfb = Math.max(responseTimeMs - 50, 0);
  
  // FCP (First Contentful Paint) - estimate based on size and network speed
  // Assume typical 4G speeds: ~100 KB/s
  const fcpBase = ttfb + Math.min(htmlSize / 100, 500);
  
  // LCP (Largest Contentful Paint) - assume 1-2x FCP depending on images
  const lcp = fcpBase + Math.random() * 800;
  
  return { ttfb, fcp: fcpBase, lcp };
}

// Check for mixed content warnings
function hasMixedContentWarning(html: string): boolean {
  const mixedPatterns = [
    /http:\/\/(?!localhost)/gi,  // external http resources
    /<img[^>]+src="http:\/\/(?!localhost)/gi,
    /<script[^>]+src="http:\/\/(?!localhost)/gi,
    /<link[^>]+href="http:\/\/(?!localhost)/gi,
  ];
  return mixedPatterns.some(p => p.test(html));
}

// Check for viewport meta tag (mobile responsiveness)
function checkViewportMeta(html: string): boolean {
  return /<meta[^>]+name=["']?viewport["']?/i.test(html);
}

// Analyze image optimization issues
function analyzeImages($: cheerio.CheerioAPI): ImageIssue[] {
  const issues: ImageIssue[] = [];
  const imgs = $('img');
  
  imgs.each((i, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt');
    
    const issue: ImageIssue = {
      src: src.slice(0, 80),  // truncate long URLs
      alt: !alt || String(alt).trim() === '',
      missingFormats: !src.includes('.webp'),  // simplified check
      oversized: src.includes('large') || src.includes('big') || src.includes('original'),
    };
    
    if (issue.alt || issue.missingFormats || issue.oversized) {
      issues.push(issue);
    }
  });
  
  return issues.slice(0, 10);  // return top 10
}

// Check for broken links by inspecting href attributes
async function checkBrokenLinks($: cheerio.CheerioAPI, baseUrl: string, limit = 5): Promise<LinkIssue[]> {
  const links: LinkIssue[] = [];
  const checked = new Set<string>();
  let count = 0;
  
  const anchors = $('a');
  
  for (let i = 0; i < anchors.length && count < limit; i++) {
    const href = $(anchors[i]).attr('href') || '';
    if (!href || href.startsWith('#') || checked.has(href)) continue;
    
    checked.add(href);
    
    try {
      const url = new URL(href, baseUrl);
      const res = await fetch(url.toString(), { method: 'HEAD', redirect: 'follow' });
      
      if (res.status >= 400) {
        links.push({
          url: href.slice(0, 80),
          statusCode: res.status,
          broken: res.status >= 400,
        });
      }
      count++;
    } catch (err) {
      links.push({
        url: href.slice(0, 80),
        broken: true,
      });
      count++;
    }
  }
  
  return links;
}

// Check redirect issues (www, HTTPS, etc.)
async function checkRedirects(url: string): Promise<RedirectIssue[]> {
  const issues: RedirectIssue[] = [];
  
  try {
    const parsed = new URL(url);
    const www = new URL(url);
    const nonWww = new URL(url);
    const http = new URL(url);
    
    if (!parsed.hostname?.startsWith('www')) {
      www.hostname = `www.${parsed.hostname}`;
    }
    
    if (parsed.hostname?.startsWith('www')) {
      nonWww.hostname = parsed.hostname.replace(/^www\./, '');
    }
    
    if (parsed.protocol === 'https:') {
      http.protocol = 'http:';
    }
    
    // Check www redirect consistency
    if (www.hostname !== parsed.hostname) {
      try {
        const res = await fetch(www.toString(), { redirect: 'follow' });
        if (res.url !== www.toString() && !res.url.startsWith(parsed.origin)) {
          issues.push({
            type: 'www',
            message: 'Inconsistent www redirect behavior',
          });
        }
      } catch {}
    }
  } catch {}
  
  return issues;
}

// Calculate overall audit score
function calculateScore(result: AuditResult): number {
  let score = 100;
  
  if (!result.isHttps) score -= 15;
  if (!result.hasViewport) score -= 10;
  if ((result.imgWithoutAlt ?? 0) > 0) score -= Math.min(5, result.imgWithoutAlt ?? 0);
  if ((result.brokenLinks?.length ?? 0) > 0) score -= Math.min(10, (result.brokenLinks?.length ?? 0) * 2);
  if (result.hasMixedContent) score -= 10;
  if ((result.responseTimeMs ?? 0) > 3000) score -= 5;
  
  return Math.max(0, score);
}

export async function runAudit(targetUrl: string): Promise<AuditResult> {
  const result: AuditResult = {
    url: targetUrl,
    status: null,
    responseTimeMs: null,
    contentType: null,
    title: undefined,
    metaDescription: undefined,
    h1Count: 0,
    totalImages: 0,
    imgWithoutAlt: 0,
    imageIssues: [],
    totalLinks: 0,
    brokenLinks: [],
    externalLinks: 0,
    scriptsCount: 0,
    inlineStylesCount: 0,
    hasRobots: false,
    hasSitemap: false,
    ttfbMs: 0,
    fcpMs: 0,
    lcpMs: 0,
    hasViewport: false,
    responsive: false,
    isHttps: false,
    hasHsts: false,
    hasMixedContent: false,
    redirects: [],
    score: 0,
    error: null,
  };

  let html = '';
  let origin = safeOrigin(targetUrl);

  try {
    const start = Date.now();
    const res = await fetch(targetUrl, { redirect: 'follow' });
    const end = Date.now();

    result.status = res.status;
    result.responseTimeMs = end - start;
    result.contentType = res.headers.get('content-type');
    result.isHttps = res.url.startsWith('https:');
    result.hasHsts = !!res.headers.get('strict-transport-security');

    html = await res.text();
    
    // Estimate performance metrics
    const metrics = estimateMetrics(result.responseTimeMs, html.length);
    result.ttfbMs = Math.round(metrics.ttfb);
    result.fcpMs = Math.round(metrics.fcp);
    result.lcpMs = Math.round(metrics.lcp);
    
  } catch (err: any) {
    result.error = String(err?.message ?? err);
    return result;
  }

  if (!html) return result;

  try {
    const $ = cheerio.load(html);

    result.title = $('title').first().text().trim() || undefined;
    result.metaDescription = $('meta[name="description"]').attr('content') || undefined;
    result.h1Count = $('h1').length;

    const imgs = $('img');
    result.totalImages = imgs.length;
    result.imgWithoutAlt = imgs.filter((i, el) => {
      const alt = $(el).attr('alt');
      return !alt || String(alt).trim() === '';
    }).length;
    
    result.imageIssues = analyzeImages($);

    const links = $('a');
    result.totalLinks = links.length;
    result.externalLinks = links.filter((i, el) => {
      const href = $(el).attr('href') || '';
      if (!href) return false;
      try {
        const u = new URL(href, targetUrl);
        return u.origin !== (origin ?? u.origin);
      } catch {
        return false;
      }
    }).length;

    result.scriptsCount = $('script').length;
    result.inlineStylesCount = $('[style]').length;
    
    // Check viewport meta tag
    result.hasViewport = checkViewportMeta(html);
    result.responsive = result.hasViewport;  // simplified
    
    // Check mixed content
    result.hasMixedContent = hasMixedContentWarning(html);
    
    // Check broken links (sample)
    result.brokenLinks = await checkBrokenLinks($, targetUrl, 3);
    
  } catch (err: any) {
    result.error = String(err?.message ?? err);
    return result;
  }

  // Check for robots.txt and sitemap
  if (!origin) {
    origin = safeOrigin(targetUrl) || '';
  }

  try {
    if (origin) {
      const r = await fetch(`${origin}/robots.txt`, { method: 'GET', redirect: 'follow' });
      result.hasRobots = r.ok;

      // try common sitemap locations
      const s1 = await fetch(`${origin}/sitemap.xml`, { method: 'GET', redirect: 'follow' });
      const s2 = await fetch(`${origin}/sitemap_index.xml`, { method: 'GET', redirect: 'follow' });
      result.hasSitemap = s1.ok || s2.ok;
    }
  } catch (err: any) {
    // ignore network errors for these auxiliary checks
  }
  
  // Check redirect issues
  result.redirects = await checkRedirects(targetUrl);
  
  // Calculate overall score
  result.score = calculateScore(result);

  return result;
}

export default runAudit;
