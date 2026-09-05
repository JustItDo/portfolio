// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

const SITE_URL = 'https://justdolt.pl';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // strony zostają statyczne (domyślnie prerenderowane); adapter obsługuje
  // jedyny dynamiczny endpoint POST /api/contact (prerender = false)
  adapter: node({
    mode: 'standalone',
    // druga warstwa obok limitu body w Caddyfile — endpoint kontaktowy nie
    // potrzebuje więcej niż kilka KB (audytor-bezpieczenstwa, 2026-09-05)
    bodySizeLimit: 64 * 1024,
  }),
  integrations: [sitemap()],
  build: {
    // domyślny próg 4kB zostawiał Layout.css (~5.6 KiB) jako osobny,
    // renderowanie-blokujący request — 'always' wkleja cały CSS strony
    // wprost do HTML (Lighthouse: "Prośby o zablokowanie renderowania")
    inlineStylesheets: 'always',
  },
  security: {
    // BEZ tego Astro ignoruje X-Forwarded-For zza Caddy i clientAddress w
    // src/pages/api/contact.ts zawsze wychodzi jako 127.0.0.1 (adres Caddy) —
    // rate-limit per-IP staje się globalny, jedna osoba blokuje formularz
    // wszystkim (audytor-bezpieczenstwa, 2026-09-05). Bez pola `protocol`:
    // Caddy→Node idzie po zwykłym HTTP, dopisanie `protocol: 'https'` tu
    // wywaliłoby walidację nagłówka i wrócił by ten sam błąd.
    allowedDomains: [{ hostname: new URL(SITE_URL).hostname }],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
