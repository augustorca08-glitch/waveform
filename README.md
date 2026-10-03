# WAVEFORM

Sitio de marca y ecommerce (demo) para una marca ficticia de surf y streetwear.
Next.js 16 · Tailwind v4 · Motion · Zustand · Lenis.

## Comandos

```bash
npm run dev            # desarrollo en http://localhost:3000
npm run build          # build de producción
npm run test:e2e       # Playwright (desktop 1440×900 y mobile 390×844), requiere build previo
npm run placeholders   # regenera placeholders faltantes (nunca pisa tus archivos)
```

Las capturas de Playwright quedan en `shots/desktop` y `shots/mobile`.

## Reemplazar assets

### Video del hero
Colocá tu archivo en **`public/videos/hero.mp4`**. No hace falta tocar código:
en desarrollo alcanza con recargar; en producción, volvé a hacer `npm run build`.

- Opcional: `public/videos/hero-mobile.mp4` (corte vertical 9:16 para pantallas < 768px).
- Poster/fallback: `public/videos/hero-poster.jpg` (idealmente el primer frame del video, 1920×1080).
- Recomendado: H.264, sin audio, 8-15 s en loop, menos de 4 MB.

Mientras el video no existe, el hero usa el poster y en desarrollo muestra la etiqueta
`VIDEO PLACEHOLDER`. El video tiene autoplay, muted, loop y playsInline; se carga en idle
(no bloquea la carga inicial), no se reproduce con `prefers-reduced-motion`, Save-Data o 2G,
se pausa fuera de pantalla y tiene botón de pausa/reproducción accesible.

### Fotos
Todos los placeholders son locales y dicen `PLACEHOLDER` con su nombre y ratio.
Sobrescribí el archivo con el mismo nombre, o cambiá la ruta en el manifiesto:

| Qué | Dónde | Ratio |
|---|---|---|
| Productos | `public/media/products/{slug}/{color}-{1,2,3}.jpg` (frente, espalda, detalle) | 4:5 |
| Slots editoriales (drop, categorías, lookbook, CTA, about) | `src/content/media.ts` | indicado en cada slot |
| Macros de detalle | `public/media/details/*.jpg` | 1:1 |

El catálogo (nombres, precios, colores, talles y stock mock) vive en `src/content/products.ts`.

## Pendientes para producción
- Número real de WhatsApp en `src/lib/site.ts` (`WHATSAPP_NUMBER`).
- Pasarela de pago real en `src/components/checkout/checkout-flow.tsx` (hoy el checkout es simulado).
- Dominio real en `metadataBase` (`src/app/layout.tsx`).
