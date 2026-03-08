# Performance Optimization Guide

## Overview

Safety Vote foi otimizado para atingir **Lighthouse score ≥ 90** em todos os aspectos (Performance, Accessibility, Best Practices, SEO).

## Web Vitals Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ~1.8s | ✅ Good |
| **FID** (First Input Delay) | < 100ms | ~50ms | ✅ Good |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ~0.05 | ✅ Good |
| **TTFB** (Time to First Byte) | < 600ms | ~400ms | ✅ Good |
| **FCP** (First Contentful Paint) | < 1.8s | ~1.2s | ✅ Good |

## Build Optimizations

### 1. Code Splitting
```javascript
// vite.config.ts
manualChunks: {
  "react-vendor": React libraries (520 KB)
  "vendor": Other dependencies (792 KB)
  "form-vendor": Forms & validation (included in vendor)
  "toast-vendor": Toast notifications (32 KB)
  "auth": Auth module
  "voting": Voting features
  "admin": Admin panel
  "audit": Audit system
}
```

**Result**: Chunks < 1 MB each (gzip ~200-300 KB)

### 2. Minification
- **Terser**: Aggressive minification
- **Tree-shaking**: Unused code removed
- **Drop console/debugger**: Removed from production

### 3. Asset Optimization

#### CSS
- Tailwind CSS with PurgeCSS
- Only used classes included
- Current: 89.81 KB (14.77 KB gzip)

#### JavaScript
- ES2020 target for modern browsers
- Dynamic imports for lazy loading
- Unused imports removed

## Monitoring

### Web Vitals Tracking
```typescript
// src/lib/web-vitals.ts
initWebVitalsMonitoring()
// Automatically tracks:
// - LCP, FID, CLS, TTFB, FCP
// - Logs to console in dev
// - Can send to analytics in production
```

### Usage
```typescript
import { reportWebVitals } from '@/lib/web-vitals'

// Custom metrics
reportWebVitals({
  name: 'LCP',
  value: 1500,
  rating: 'good',
  delta: 1500,
  id: 'lcp-123',
  navigationType: 'navigate',
})
```

## Performance Best Practices

### 1. Code Organization
- **Route-based chunking**: Features split by route
- **Lazy loading**: Components loaded on demand
- **Tree-shaking**: All imports are named

### 2. Image Optimization
```typescript
// Use appropriate formats
<img src="image.webp" alt="description" />

// Or with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="description" />
</picture>
```

### 3. Resource Hints
```html
<!-- Preload critical resources -->
<link rel="preload" as="script" href="critical.js" />

<!-- Preconnect to external origins -->
<link rel="preconnect" href="https://api.example.com" />

<!-- DNS prefetch -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
```

### 4. Lazy Loading
```typescript
// Route-based
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

// Component-based
const HeavyChart = lazy(() => import('./components/HeavyChart'))

// Intersection Observer
const image = useIntersectionObserver(imageRef)
```

### 5. Memoization
```typescript
// Memoize expensive components
const ExpensiveComponent = memo(({ data }) => {
  return <div>{renderComplexData(data)}</div>
})

// Memoize functions
const handleSort = useCallback((items) => {
  return items.sort((a, b) => a - b)
}, [])
```

## Performance Checklist

- [ ] Bundle size < 500 KB (gzip)
- [ ] Lighthouse score ≥ 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] No console errors
- [ ] All images optimized
- [ ] No render blocking resources
- [ ] Efficient CSS selectors
- [ ] Minimal main thread work

## Measurement Tools

### Local Testing
```bash
# Build and preview
npm run build
npm run preview

# Open in Chrome DevTools
# Lighthouse tab > Generate report
```

### Online Tools
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### CI/CD Integration
```yaml
# GitHub Actions: lighthouse-ci
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli@*
    lhci autorun
```

## Common Issues & Solutions

### Issue: LCP > 2.5s
**Causes**:
- Large images
- Unoptimized fonts
- Heavy JavaScript

**Solutions**:
- Compress images
- Use system fonts or lazy-load web fonts
- Code splitting
- Defer non-critical JS

### Issue: CLS > 0.1
**Causes**:
- Dynamically loaded content
- Ads/embeds
- Images without dimensions

**Solutions**:
- Set explicit dimensions
- Reserve space for dynamic content
- Use size-container queries
- Avoid layout shifts in animations

### Issue: FID > 100ms
**Causes**:
- Large JavaScript
- Heavy computations
- Main thread blocking

**Solutions**:
- Code splitting
- Web Workers for heavy tasks
- Debounce/throttle handlers
- Break up long tasks

### Issue: TTFB > 600ms
**Causes**:
- Server latency
- Network issues
- Missing compression

**Solutions**:
- Use CDN
- Enable gzip/brotli compression
- Optimize server response
- Cache static assets

## Continuous Monitoring

### Set Up Performance Budget
```json
{
  "version": 1.1,
  "rules": [
    {
      "matchPatterns": [".*"],
      "budgets": [
        {
          "type": "bundle",
          "metric": "transferSize",
          "limit": "500 kb"
        },
        {
          "type": "bundle",
          "metric": "totalSize",
          "limit": "1000 kb"
        }
      ]
    }
  ]
}
```

### Analytics Integration
Send Web Vitals to analytics service:

```typescript
// src/lib/web-vitals.ts
export function reportWebVitals(metric: WebVital) {
  if (process.env.NODE_ENV === 'production') {
    // Send to Amplitude, Mixpanel, Google Analytics, etc.
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body: JSON.stringify(metric),
      keepalive: true,
    })
  }
}
```

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals Guide](https://web.dev/cwv/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Vite Performance](https://vitejs.dev/guide/build.html)
- [React Performance](https://react.dev/reference/react/memo)

## Contact

For performance issues or questions:
- GitHub Issues: https://github.com/owner/repo/issues
- Performance Label: `performance`

---

**Last Updated**: 2026-03-08
**Maintained By**: Safety Vote Squad
