// tests/pip/home/form-validation-hubspot.spec.ts
import { test, expect } from '@playwright/test';

/** Pages to scan */
const PAGES = [
  'https://partnerinpublishing.com/',
  'https://partnerinpublishing.com/services/',
  'https://partnerinpublishing.com/about/',
  'https://partnerinpublishing.com/contact-us/',
  'https://partnerinpublishing.com/pip-guides/the-pip-guide-to-ai-powered-edtech-sales/',
];

/** HubSpot indicators (hosts/patterns) */
const HS = [
  'hubspot.com',
  'hubspot.net',
  'api.hubspot.com',
  'track.hubspot.com',
  'hsforms.com',
  'forms.hsforms.com',
  'forms-na1.hsforms.com',
  'api.hsforms.com',
  'js.hs-analytics.net',
  'js.hs-scripts.com',
];

/** Returns true if URL matches any HubSpot pattern */
function isHubSpot(url: string) {
  const u = url.toLowerCase();
  return HS.some(h => u.includes(h));
}

test.describe('PIP site - Forms should be connected to HubSpot', () => {
  for (const url of PAGES) {
    test(`scan forms and network on: ${url}`, async ({ page, context }) => {
      // --- Evidence buckets
      const hsAssets: string[] = [];      // scripts/iframes/links to HS (strong signal)
      const hsFormActions: string[] = []; // <form action="...hubspot...">
      const hsPosts: string[] = [];       // XHR/fetch/document POSTs to HS (would be strongest)
      let hsGlobals = false;              // window.hbspt or window._hsq
      let hsCookies = false;              // hubspot cookies (__hstc, __hssc, hubspotutk, etc.)

      // --- Observe network (do NOT block by default)
      await page.route('**/*', async (route) => {
        const req = route.request();
        const url = req.url();
        const method = req.method();
        const rt = req.resourceType(); // 'document','script','xhr','fetch','stylesheet','image','font','iframe',...

        // Strong signals: HS assets present on page load
        if (isHubSpot(url) && ['script', 'iframe', 'xhr', 'fetch', 'document'].includes(rt)) {
          hsAssets.push(`[${rt}] ${url}`);
        }

        // If a POST goes to HubSpot, that’s a definitive connection
        if (method === 'POST' && isHubSpot(url)) {
          hsPosts.push(`${rt}:${url}`);
          // We still continue so the page remains stable; no real user data is sent because we prevent form submit below.
          // If you want to be ultra-safe: return route.abort();
        }

        return route.continue();
      });

      // --- Go and allow client-side form rendering
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);

      // --- Check DOM assets (script/link/iframe) that point to HS (anchors excluded)
      const domAssets = await page.evaluate((needles: string[]) => {
        const lower = (s: string) => s.toLowerCase();
        const nodes: (HTMLScriptElement | HTMLIFrameElement | HTMLLinkElement)[] = [
          ...Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[],
          ...Array.from(document.querySelectorAll('iframe[src]')) as HTMLIFrameElement[],
          ...Array.from(document.querySelectorAll('link[href]')) as HTMLLinkElement[],
        ];
        const hits: string[] = [];
        for (const n of nodes) {
          const url = (n as HTMLScriptElement).src || (n as HTMLIFrameElement).src || (n as HTMLLinkElement).href || '';
          const u = lower(url);
          if (needles.some(h => u.includes(h))) hits.push(url);
        }
        return hits;
      }, HS);
      hsAssets.push(...domAssets.map(u => `[dom] ${u}`));

      // --- Check HubSpot globals (hbspt / _hsq) and cookies (hubspotutk, __hstc, __hssc)
      hsGlobals = await page.evaluate(() => {
        // @ts-ignore
        const hasHbspt = typeof window !== 'undefined' && !!(window as any).hbspt;
        // @ts-ignore
        const hasHSQ = typeof window !== 'undefined' && Array.isArray((window as any)._hsq);
        return hasHbspt || hasHSQ;
      });

      // Cookies: check names only (value not needed)
      const cookies = await context.cookies();
      const cookieNames = new Set(cookies.map(c => c.name.toLowerCase()));
      const hubspotCookieNames = ['hubspotutk', '__hstc', '__hssc', '__hsfp', '__hs_do_not_track'];
      hsCookies = hubspotCookieNames.some(n => cookieNames.has(n));

      // --- Forms scanning: action to HS and try a guarded "submit"
      const formLocator = page.locator('form');
      const formCount = await formLocator.count();

      for (let i = 0; i < formCount; i++) {
        const form = formLocator.nth(i);

        // Check form action
        const action = (await form.getAttribute('action')) || '';
        if (action && isHubSpot(action)) hsFormActions.push(action);

        // Prevent real submission to avoid navigation/data exfiltration
        await form.evaluate((node: HTMLFormElement) => {
          node.addEventListener('submit', (e) => e.preventDefault(), { capture: true, once: true });
        });

        // Best-effort fill (optional; kept for parity)
        const candidates = [
          'input[name*=first]', 'input[name*=last]', 'input[name*=name]',
          'input[type=email]', 'input[name*=email]',
          'input[name*=company]', 'input[name*=org]', 'input[name*=organization]',
          'textarea'
        ];
        for (const sel of candidates) {
          const field = form.locator(sel).first();
          if (await field.count()) {
            const type = (await field.getAttribute('type')) || 'text';
            const val =
              type === 'email' ? 'qa@example.com' :
              sel.includes('first') ? 'QA' :
              sel.includes('last') ? 'Bot' :
              sel.includes('name') ? 'QA Bot' :
              (sel.includes('company') || sel.includes('org')) ? 'DevPip' :
              'Test';
            await field.fill(val);
          }
        }

        // Try submit click without waiting for navigation
        const submit = form.locator('button[type=submit], input[type=submit]').first();
        if (await submit.count()) {
          await submit.click({ noWaitAfter: true });
          await page.waitForTimeout(600); // small window for XHR/fetch to fire
        }
      }

      // --- Pass/Fail policy (we WANT evidence of HubSpot)
      // Strong signals: POSTs to HS, form action to HS, HS assets/iframe, HS globals, HS cookies
      const hasHsConnection =
        hsPosts.length > 0 ||
        hsFormActions.length > 0 ||
        hsAssets.length > 0 ||
        hsGlobals ||
        hsCookies;

      expect(hasHsConnection, [
        `No HubSpot integration detected on ${url}.`,
        `Checked signals:`,
        `- assets: ${hsAssets.length}`,
        `- form actions: ${hsFormActions.length}`,
        `- POSTs: ${hsPosts.length}`,
        `- globals(hbspt/_hsq): ${hsGlobals}`,
        `- cookies(hubspotutk/__hstc/__hssc): ${hsCookies}`,
      ].join('\n')).toBeTruthy();

      // Optional: helpful log in the report
      test.info().annotations.push({
        type: 'HubSpot',
        description: [
          `assets: ${hsAssets.slice(0, 5).join('\n')}${hsAssets.length > 5 ? '\n…' : ''}`,
          `form actions: ${hsFormActions.join('\n') || '(none)'}`,
          `posts: ${hsPosts.join('\n') || '(none)'}`,
          `globals: ${hsGlobals}, cookies: ${hsCookies}`,
        ].join('\n'),
      });
    });
  }
});
