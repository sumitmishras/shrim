# Testing Checklist (Hinglish)

Ye list upar se neeche, **order me** karni hai. Har step me URL diya hai. Jahan ✅ likha hai wahan wo result dikhna chahiye.
Kuch galat lage to us step ka number aur screenshot bhej dijiye.

> Zyada tar checks **phone par bhi** kijiye (Chrome me `Ctrl+Shift+M`, ya sach me phone par same WiFi se `http://<aapke-computer-ka-IP>:3000`).
> Test leads par naam me **TEST** likhiye, taaki baad me pehchaan kar delete kar sakein.

---

## 0. Pehle site chalaiye

1. Terminal kholiye, `shrim/app` folder me jaaiye.
2. `docker compose up -d db`
3. `npm run dev`
4. Browser me `http://localhost:3000` kholiye. ✅ Site dikhni chahiye.

**Rate limit ka dhyaan:** ek computer se ghante me sirf 5 forms jaa sakte hain (spam se bachne ke liye). Testing me 5 se zyada ho jayein to
terminal me `Ctrl+C` karke `npm run dev` dobara chalaiye (limit reset ho jaati hai). Ya `.env` me `LEAD_RATE_LIMIT=50` likh dijiye.

---

## 1. Admin login

| # | Kya karna hai | URL | ✅ Kya dikhna chahiye |
|---|---|---|---|
| 1.1 | Email `owner@shrimconstruction.in` aur `.env` ka `SEED_ADMIN_PASSWORD` se login | http://localhost:3000/admin | Dashboard khulta hai, upar "Today" likha hai |
| 1.2 | **Password badaliye** (neeche account icon → Account) | http://localhost:3000/admin/account | Naya strong password save hota hai |
| 1.3 | Galat password 3-4 baar daaliye | http://localhost:3000/admin/login | Error aata hai (5 galat par account 10 minute ke liye lock) |
| 1.4 | Phone par (360px) admin kholiye | http://localhost:3000/admin | Koi cheez screen se bahar nahi jaati, buttons aasaani se dabte hain |

## 2. Settings bharna (sabse pehle ye)

**Settings → Site Settings** (http://localhost:3000/admin/globals/siteSettings)

| # | Kya karna hai | ✅ Result |
|---|---|---|
| 2.1 | Phone aur WhatsApp number daaliye (WhatsApp me `91` ke saath, jaise `919876543210`) | Save ke baad site par Call / WhatsApp buttons dikhne lagte hain (phone par neeche bar me aur header me) |
| 2.2 | Email, office hours, address (full + short), "show full address" tick/untick | Footer aur Contact page badalte hain |
| 2.3 | Social links daaliye (Instagram, Facebook, YouTube, Google Business) | Footer me links aate hain; khali chhodo to nahi aate |
| 2.4 | Trust stats: `projectCount` me asli number daaliye (jaise `25`) | Home par "25 Projects completed" counter dikhta hai. **Wapas `[PROJECT COUNT]` kar do to wo box gayab ho jaata hai** |
| 2.5 | Hero me video (3 MB se kam) aur poster upload kijiye | Home par hero me video chalta hai (muted, loop). Video hata do to image dikhti hai |
| 2.6 | "Google / SEO details" me latitude/longitude daaliye | (Google Maps me office pin par right-click → numbers copy) |

**Settings → Rates** (http://localhost:3000/admin/globals/rates)

| # | Kya karna hai | ✅ Result |
|---|---|---|
| 2.7 | Asli per-sq-ft rates daaliye, "SAMPLE" tick hata dijiye | Service pages par "Starting from ₹…" badal jaata hai |
| 2.8 | Fabrication → "Starting from ₹X per kg" chuniye, rate daaliye | http://localhost:3000/services/fabrication par "₹X per kg" dikhta hai. "Quote on request" wapas karne par waisa dikhta hai |

## 3. Home page (desktop aur phone)

http://localhost:3000/

| # | Check | ✅ Result |
|---|---|---|
| 3.1 | Hero, heading, 2 buttons | "Book a Free Site Visit" → `/site-visit`, "Calculate Cost" → `/cost-calculator` |
| 3.2 | Trust strip | 7+ saal, GST, Chinhat. Project count tabhi dikhta hai jab asli number ho |
| 3.3 | Services ke 5 cards | Click karne par us service ka page khulta hai |
| 3.4 | Before/After slider (jab projects me photos hon) | Ungli/mouse se slider khinchne par photo badalti hai |
| 3.5 | Calculator teaser: area `1800`, floors `2`, Calculate Cost | `/cost-calculator` khulta hai, area aur floors bhare hue, result turant dikhta hai |
| 3.6 | Process timeline scroll karke | Line neeche tak banti hai, 5 steps aate hain |
| 3.7 | FAQ | Question par click karne se answer khulta hai |
| 3.8 | Neeche form | Short form dikhta hai |
| 3.9 | **Phone par:** neeche bar | Call, WhatsApp, Site Visit. Ye bar kisi button/text ko dhakta nahi (page ke end tak scroll karke dekhiye) |
| 3.10 | Upar "हिंदी" par click | Poora page Hindi me, URL `/hi` ho jaata hai. "English" par wapas |
| 3.11 | Computer ko dark mode me kijiye | Site dark ho jaati hai, sab padhne layak |

## 4. Service pages

| # | URL | ✅ Check |
|---|---|---|
| 4.1 | http://localhost:3000/services | 5 cards |
| 4.2 | http://localhost:3000/services/house-construction | Problems, included, 3 tiers (Basic/Standard/Premium) rates ke saath, process, FAQ. Desktop par form upar dikhta hai, phone par button |
| 4.3 | http://localhost:3000/services/interior, `/renovation`, `/turnkey` | Isi tarah |
| 4.4 | http://localhost:3000/services/fabrication | "Quote on request" (ya per kg rate) |
| 4.5 | `/hi/services/interior` | Hindi me. Hindi **natural** lagni chahiye. Jo line ajeeb lage, note kijiye |

## 5. Free Site Visit form (sabse zaroori)

http://localhost:3000/site-visit

| # | Kya karna hai | ✅ Result |
|---|---|---|
| 5.1 | Step 1 par kuch chune bina "Next" | Error: "Please choose a service" |
| 5.2 | House Construction chuniye → Next. Area `1800`, floors `2`, locality `Chinhat`, "Plot is ready" → Next | Step 3 aata hai, progress bar badhti hai |
| 5.3 | Budget `₹25–50 lakh`, "Immediately" → Next | Step 4 |
| 5.4 | Naam `TEST Ramesh`, phone `12345`, consent **bina tick kiye** Submit | Phone aur consent dono ke error aate hain, form nahi jaata |
| 5.5 | Phone `5876543210` (5 se shuru) | Error (number 6, 7, 8 ya 9 se shuru hona chahiye) |
| 5.6 | Apna asli number daaliye, consent tick karke Submit | `/thank-you` khulta hai, **reference number** (jaise `SHR-2026-0001`) dikhta hai |
| 5.7 | Thank-you par "Chat on WhatsApp" dabaiye | WhatsApp khulta hai, message me reference number likha hai |
| 5.8 | **Admin → Leads** | Lead dikhti hai: sahi naam, phone, service, locality, status "New", score **Hot (91)** |
| 5.9 | Lead kholiye → "Source & attribution" tab | Device, landing page, consent time aur consent version dikhta hai |
| 5.10 | Consent checkbox form khulte hi | **Tick nahi hona chahiye** (by default khali) |

### UTM attribution test
| # | Kya karna hai | ✅ Result |
|---|---|---|
| 5.11 | Ye link kholiye: http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=test&gclid=ABC123 | |
| 5.12 | Phir `/site-visit` par ek TEST lead bhejiye | Admin me us lead ke attribution me `utm_source=google`, `utm_campaign=test`, `gclid=ABC123`, channel **Google Ads** |
| 5.13 | Aise hi `?utm_source=facebook&utm_medium=paid_social&fbclid=XYZ` | Channel **Meta Ads** |

## 6. Cost calculator

http://localhost:3000/cost-calculator?area=1800&floors=2

| # | Check | ✅ Result |
|---|---|---|
| 6.1 | Result turant | Ek **range** dikhta hai (jaise ₹68 Lakh – ₹83.2 Lakh), ek number nahi. Neeche % breakdown aur disclaimer |
| 6.2 | Quality "Premium" karke | Range badal jaata hai |
| 6.3 | Parking / Boundary wall tick karke | Range badhta hai (rates me jo extras daale hain) |
| 6.4 | Service "Interior" chuniye | Floors wala box gayab ho jaata hai |
| 6.5 | Neeche naam, number, consent → "Send me the breakdown" | Thank-you aata hai. Admin lead me "Calculator" JSON me aapke inputs aur estimate |

## 7. Chhote forms

| # | URL | ✅ Check |
|---|---|---|
| 7.1 | http://localhost:3000/contact | Naam, number, service, consent → lead save, thank-you |
| 7.2 | Kisi service page ka form | Lead me service pehle se sahi, source "Service page" |
| 7.3 | Ek hi computer se 6 forms bhejiye | 6th par message: "Too many requests…". Server restart karne par phir chalta hai |

## 8. Telegram alert

Pehle **TELEGRAM_SETUP.md** padhkar bot banaiye aur `.env` me token + chat ID daaliye, server restart kijiye.

| # | Kya karna hai | ✅ Result |
|---|---|---|
| 8.1 | Koi TEST lead bhejiye | Kuch second me Telegram par message: naam, phone, service, score (Hot/Warm/Cold), admin ka link |
| 8.2 | `.env` me token hata dijiye aur lead bhejiye | Lead phir bhi save hoti hai. Terminal me alert print hota hai. Site me koi error nahi |

## 9. CRM (admin ka kaam)

Ek-do TEST leads bana lijiye. Phone par bhi kijiye.

| # | Kya karna hai | URL | ✅ Result |
|---|---|---|---|
| 9.1 | Dashboard | http://localhost:3000/admin | Aaj ke naye leads, follow-ups, overdue (laal), pipeline, source report, "Won this month" |
| 9.2 | Ek lead kholiye, **Next follow-up** me kal se pehle ki tareekh daaliye → Save | `/admin/collections/leads` | Dashboard par wo lead **laal** me "X days late" ke saath |
| 9.3 | Lead ke upar buttons | lead ka page | "📞 Call" aur "💬 WhatsApp" us lead ke number par |
| 9.4 | **Calculator wali lead** kholiye | lead ka page | "📤 Send breakdown on WhatsApp" button. Dabane par WhatsApp me **Hindi message**: naam, estimate range, breakdown. Aap apne WhatsApp se bhej sakte hain |
| 9.5 | Leads list: Status / Score / Source / Service / Date filter | http://localhost:3000/admin/collections/leads | List filter hoti hai. "Clear filters" se wapas |
| 9.6 | List me status wale dropdown se status badliye | list | Turant save. Lead kholkar "Status history" me entry (kisne, kab) |
| 9.7 | "⬇ Export CSV" | list | CSV download. Excel me Hindi theek khulti hai |
| 9.8 | Status "Won" karke Won amount (₹) bhariye | lead | Dashboard me "Won this month" me jud jaata hai |
| 9.9 | Status "Lost" → Lost reason chuniye | lead | Reason dropdown dikhta hai |
| 9.10 | Notes me ek note likhiye | lead | Note ke saath samay aur aapka naam |

### Staff user (sirf leads dekhne wala)
| # | Kya karna hai | ✅ Result |
|---|---|---|
| 9.11 | Admin → Users → Create → role **Staff** | |
| 9.12 | Doosre browser (incognito) me staff se login | Sirf Leads aur Dashboard dikhte hain. Projects, Rates, Settings nahi |
| 9.13 | Staff: status badal sakta hai, notes likh sakta hai | ✅ |
| 9.14 | Staff: Delete ya Export CSV | **Nahi dikhna chahiye** |

## 10. Roz subah 9 baje ka Telegram digest

| # | Kya karna hai | ✅ Result |
|---|---|---|
| 10.1 | Dashboard ke neeche "✉ Send today's digest to Telegram now" | Telegram par: aaj ke follow-ups, overdue, kal ke naye leads. Kuch na ho to "Nothing to report" |
| 10.2 | Asli digest | Server chalte rehne par roz subah **9 baje (IST)** apne aap aata hai. Agar kuch report karne ko nahi to koi message nahi |

## 11. Apna content daalna

| # | Kya karna hai | URL | ✅ Result |
|---|---|---|---|
| 11.1 | Media me 3-4 photos upload (alt text zaroori) | http://localhost:3000/admin/collections/media | Photos 2400px tak chhoti ho jaati hain. 10 MB se bada video **mana** hota hai |
| 11.2 | Ek Project banaiye: title, service, area, before/after/gallery photos → Status **Published** | http://localhost:3000/admin/collections/projects/create | Save karte hi http://localhost:3000/projects par dikhta hai (refresh ke 1-2 second me) |
| 11.3 | Wahi project kholiye | `/projects/<slug>` | Before/After slider, gallery par click se bada photo (Esc se band, arrow se agli) |
| 11.4 | Projects list me filter (service, area) | http://localhost:3000/projects | Filter kaam karta hai |
| 11.5 | Project ko "Featured" kijiye | home | Home par featured projects aur before/after me aata hai |
| 11.6 | Testimonial: **consent tick** ke bina Published karne ki koshish | admin → Testimonials | Error: "Cannot publish without the client's consent" |
| 11.7 | Testimonial (consent ke saath) publish | home | Testimonials section dikhta hai. Koi testimonial na ho to section gayab |
| 11.8 | Hindi tab me (upar language picker) same project ka Hindi text | admin | `/hi/projects/<slug>` par Hindi |
| 11.9 | Guide likhiye aur publish karein | admin → Guides | http://localhost:3000/guides par aata hai, article me table of contents aur CTA box |
| 11.10 | FAQ badaliye | admin → Faqs | Home ya service page par turant badalta hai |
| 11.11 | **Sample content hatana:** terminal me `npm run samples:unpublish` | | `[SAMPLE – REPLACE]` wale projects/testimonials chhup jaate hain, nakli photos delete |

## 12. About, Contact, legal

| # | URL | ✅ Check |
|---|---|---|
| 12.1 | http://localhost:3000/about | **PLACEHOLDER** wali line apni kahani se badaliye (admin → About page). Founder photo, team photos, GSTIN badge, map |
| 12.2 | http://localhost:3000/contact | Phone, email, address, office hours, map, form |
| 12.3 | http://localhost:3000/privacy-policy aur `/terms` | Padhiye. **Kisi vakil se zaroor check karwaiye.** Data rakhne ki avadhi 24 mahine likhi hai |
| 12.4 | http://localhost:3000/koi-galat-page | Custom 404, buttons ke saath. `/hi/koi-galat-page` Hindi me |

## 13. Hindi

| # | Kya karna hai | ✅ Result |
|---|---|---|
| 13.1 | `/hi` se har page dekhiye | Hindi **simple aur natural** lagni chahiye |
| 13.2 | `/hi/site-visit` par poora form bhariye | Hindi me errors, lead save, `/hi/thank-you` |

## 14. Tracking aur cookie banner (GTM)

Pehle **TRACKING.md** padhiye. GTM account banakar container ID (`GTM-XXXXXXX`) lijiye.

| # | Kya karna hai | ✅ Result |
|---|---|---|
| 14.1 | GTM ID **khali** rakh kar site dekhiye | Na cookie banner, na koi tracking |
| 14.2 | Admin → Settings → Tracking me ID daaliye | Site par cookie banner (English/Hindi) aata hai |
| 14.3 | Banner me kuch na dabaiye, GTM Preview chalaiye | Consent tab me analytics aur ads **Denied** |
| 14.4 | "Accept all" | Banner band, Consent **Granted**, `consent_update` event |
| 14.5 | Footer me "Cookie settings" | Banner wapas, aap choice badal sakte hain |
| 14.6 | Contact form bhariye | GTM Preview me `generate_lead` event: `form_name`, `service`, `lead_score_band`, `event_id`. **Naam ya phone kahin nahi** |
| 14.7 | Call, WhatsApp, "Book Site Visit" buttons dabaiye | `call_click`, `whatsapp_click`, `cta_click` events |

## 15. SEO (live hone ke baad ye zyada kaam ka hai)

| # | Kya karna hai | URL | ✅ Result |
|---|---|---|---|
| 15.1 | Page source dekhiye (`Ctrl+U`) aur "ld+json" dhundhiye | koi bhi page | GeneralContractor, aur service page par Service + FAQPage + BreadcrumbList |
| 15.2 | Sitemap | http://localhost:3000/sitemap.xml | English aur Hindi dono ke pages. `thank-you` nahi |
| 15.3 | Robots | http://localhost:3000/robots.txt | `/admin` aur `/thank-you` blocked |
| 15.4 | Live URL par Google ka **Rich Results Test** (search.google.com/test/rich-results) | | Errors nahi (**live hone ke baad hi ho sakta hai**) |
| 15.5 | WhatsApp par site ka link bhejiye | | Preview me SHRIM ki image aur title |

## 16. Security aur final safai

| # | Kya karna hai | ✅ Result |
|---|---|---|
| 16.1 | Galat email se admin login 11 baar | 11th par "Too many failed login attempts" (15 minute rukna padega) |
| 16.2 | Admin dashboard ka laal/pila warning box | Jab tak PLACEHOLDER / [SAMPLE / "UPDATE BEFORE LAUNCH" kahin bacha hai tab tak dikhega. **Launch se pehle ye khali hona chahiye** |
| 16.3 | Saare TEST leads delete (admin me list se select karke) | |
| 16.4 | `.env` me asli secrets: naya `PAYLOAD_SECRET`, strong admin password | Kabhi `.env` kisi ko mat bhejiye |

---

## Tests jo main khud chalata hoon (aapko nahi karne)

Ye commands sirf developer ke liye hain (`shrim/app` me):

- `npm run test:logic` : validation, score, estimate, CSV, WhatsApp message, digest ka logic
- `npm run test:e2e` : saare lead forms browser me (valid, invalid phone, no consent, honeypot, rate limit)
- `npm run test:crm` : admin dashboard, filters, export, staff access
- `node scripts/test-seo.mjs`, `node scripts/test-prod.mjs`, `node scripts/test-tracking-e2e.mjs on`
- `npm run audit:a11y`, `node scripts/audit-layout.mjs`, `npm run audit:admin`
