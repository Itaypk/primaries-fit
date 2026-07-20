# tools

## og-template.html

Source for `public/og.png`, the social-preview card that WhatsApp, X and
Facebook render when someone shares a link (see the `og:image` tags in
`index.html`).

It's a plain 1200×630 HTML page using the app's own palette and typefaces, so
the preview stays visually consistent with the product. To regenerate after
editing it, serve the file and screenshot it at exactly 1200×630 — e.g. drop it
into `dist/` after a build, `npm run preview`, then in headless Chromium:

```js
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto('http://localhost:4173/og-template.html');
await page.screenshot({ path: 'public/og.png' });
```

Keep the dimensions at 1200×630 — `og:image:width`/`height` in `index.html`
declare that size, and platforms crop against it.
