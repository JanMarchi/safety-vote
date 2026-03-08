/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals for performance monitoring
 *
 * Metrics:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - FID (First Input Delay): < 100ms
 * - CLS (Cumulative Layout Shift): < 0.1
 * - TTFB (Time to First Byte): < 600ms
 * - FCP (First Contentful Paint): < 1.8s
 */

export interface WebVital {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: "navigate" | "reload" | "back_forward" | "back_forward_cache";
}

// Thresholds (https://web.dev/vitals/)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // ms
  FID: { good: 100, poor: 300 }, // ms
  CLS: { good: 0.1, poor: 0.25 }, // unitless
  TTFB: { good: 600, poor: 1800 }, // ms
  FCP: { good: 1800, poor: 3000 }, // ms
};

function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): "good" | "needs-improvement" | "poor" {
  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}

/**
 * Monitor Largest Contentful Paint (LCP)
 */
export function observeLCP(onReport: (metric: WebVital) => void) {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry) {
        const value = lastEntry.renderTime || lastEntry.loadTime;
        onReport({
          name: "LCP",
          value,
          rating: getRating(value, THRESHOLDS.LCP),
          delta: value - (performance.timing?.navigationStart || 0),
          id: `lcp-${Date.now()}`,
          navigationType: getNavigationType(),
        });
      }
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
  } catch (e) {
    console.error("LCP observer failed:", e);
  }
}

/**
 * Monitor First Input Delay (FID)
 */
export function observeFID(onReport: (metric: WebVital) => void) {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        const processingTime = entry.processingEnd - entry.processingStart;

        onReport({
          name: "FID",
          value: processingTime,
          rating: getRating(processingTime, THRESHOLDS.FID),
          delta: processingTime,
          id: `fid-${Date.now()}`,
          navigationType: getNavigationType(),
        });
      });
    });

    observer.observe({ entryTypes: ["first-input"] });
  } catch (e) {
    console.error("FID observer failed:", e);
  }
}

/**
 * Monitor Cumulative Layout Shift (CLS)
 */
export function observeCLS(onReport: (metric: WebVital) => void) {
  if (!("PerformanceObserver" in window)) return;

  try {
    let clsValue = 0;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      onReport({
        name: "CLS",
        value: clsValue,
        rating: getRating(clsValue, THRESHOLDS.CLS),
        delta: clsValue,
        id: `cls-${Date.now()}`,
        navigationType: getNavigationType(),
      });
    });

    observer.observe({ entryTypes: ["layout-shift"] });
  } catch (e) {
    console.error("CLS observer failed:", e);
  }
}

/**
 * Monitor Time to First Byte (TTFB)
 */
export function observeTTFB(onReport: (metric: WebVital) => void) {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        const ttfb = entry.responseStart - entry.requestStart;

        onReport({
          name: "TTFB",
          value: ttfb,
          rating: getRating(ttfb, THRESHOLDS.TTFB),
          delta: ttfb,
          id: `ttfb-${Date.now()}`,
          navigationType: getNavigationType(),
        });
      });
    });

    observer.observe({ entryTypes: ["navigation"] });
  } catch (e) {
    console.error("TTFB observer failed:", e);
  }
}

/**
 * Monitor First Contentful Paint (FCP)
 */
export function observeFCP(onReport: (metric: WebVital) => void) {
  if (!("PerformanceObserver" in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          onReport({
            name: "FCP",
            value: entry.startTime,
            rating: getRating(entry.startTime, THRESHOLDS.FCP),
            delta: entry.startTime,
            id: `fcp-${Date.now()}`,
            navigationType: getNavigationType(),
          });
        }
      });
    });

    observer.observe({ entryTypes: ["paint"] });
  } catch (e) {
    console.error("FCP observer failed:", e);
  }
}

/**
 * Get navigation type (navigate, reload, back_forward, etc.)
 */
function getNavigationType():
  | "navigate"
  | "reload"
  | "back_forward"
  | "back_forward_cache" {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

  if (!navigation) return "navigate";

  if (navigation.type === "navigate") return "navigate";
  if (navigation.type === "reload") return "reload";
  if (navigation.type === "back_forward") return "back_forward";
  if (navigation.type === "back_forward_cache") return "back_forward_cache";

  return "navigate";
}

/**
 * Report Web Vitals to analytics service
 */
export function reportWebVitals(metric: WebVital) {
  if (process.env.NODE_ENV === "production") {
    // Send to analytics service
    console.log(`[WebVital] ${metric.name}: ${metric.value}ms (${metric.rating})`);

    // Example: Send to custom endpoint
    // fetch('/api/analytics/vitals', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    //   keepalive: true,
    // });
  } else {
    console.debug(`[WebVital] ${metric.name}:`, metric);
  }
}

/**
 * Initialize all Web Vitals monitoring
 */
export function initWebVitalsMonitoring() {
  observeLCP(reportWebVitals);
  observeFID(reportWebVitals);
  observeCLS(reportWebVitals);
  observeTTFB(reportWebVitals);
  observeFCP(reportWebVitals);
}
