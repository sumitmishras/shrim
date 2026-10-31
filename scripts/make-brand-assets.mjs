// Generates the brand files: public/logo.svg, src/app/icon.svg, src/app/apple-icon.png, public/og-default.jpg
// Run once (node scripts/make-brand-assets.mjs). The outputs are committed, so servers never need this.
import sharp from 'sharp'
import fs from 'fs'

const font = "Space Grotesk, Helvetica Neue, Helvetica, Arial, sans-serif"
fs.writeFileSync('public/logo.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 84" role="img" aria-label="SHRIM – Construction, Interiors, Fabrication">
  <text x="0" y="46" font-family="${font}" font-size="44" font-weight="700" letter-spacing="15" fill="#1c1a17">SHRIM</text>
  <text x="2" y="72" font-family="${font}" font-size="11.5" letter-spacing="3.2" fill="#6b655c">CONSTRUCTION • INTERIORS • FABRICATION</text>
</svg>
`)
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#c8792b"/><text x="32" y="46" text-anchor="middle" font-family="${font}" font-size="40" font-weight="700" fill="#ffffff">S</text></svg>
`
fs.writeFileSync('src/app/icon.svg', icon)
await sharp(Buffer.from(icon)).resize(180, 180).png().toFile('src/app/apple-icon.png')

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c1a17"/><stop offset="1" stop-color="#2d2620"/></linearGradient>
    <radialGradient id="r" cx="0.85" cy="0.1" r="0.7"><stop offset="0" stop-color="#c8792b" stop-opacity=".45"/><stop offset="1" stop-color="#c8792b" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/><rect width="1200" height="630" fill="url(#r)"/>
  <g fill="none" stroke="#ffffff" stroke-opacity=".08" stroke-width="3"><path d="M700 470 L930 290 L1160 470 M740 440 V580 H1120 V440 M890 580 V500 H970 V580"/></g>
  <rect x="80" y="190" width="90" height="6" fill="#c8792b"/>
  <text x="76" y="320" font-family="${font}" font-size="128" font-weight="700" letter-spacing="30" fill="#f1ece4">SHRIM</text>
  <text x="80" y="384" font-family="${font}" font-size="30" letter-spacing="7" fill="#e0954a">CONSTRUCTION • INTERIORS • FABRICATION</text>
  <text x="80" y="520" font-family="${font}" font-size="38" fill="#f1ece4">Naksha se chaabi tak, ek hi team.</text>
  <text x="80" y="568" font-family="${font}" font-size="26" fill="#a39b8f">Lucknow, Uttar Pradesh</text>
</svg>`
await sharp(Buffer.from(og)).jpeg({ quality: 84 }).toFile('public/og-default.jpg')
console.log('brand assets written')
