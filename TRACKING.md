# Tracking Guide (GTM, GA4, Google Ads, Meta Pixel)

Website ka tracking **Google Tag Manager (GTM)** se chalta hai. Website sirf GTM load karti hai aur har important action par
`dataLayer` me ek event bhejti hai. GA4, Google Ads, Meta Pixel aur Microsoft Clarity ko aap **GTM ke andar** jodte hain.
Code me kuch badalna nahi padta.

> Website par kabhi bhi naam, phone number ya email dataLayer me nahi jaata. Sirf service, page ka path, score label (hot/warm/cold)
> aur lead reference number jaata hai.

---

## 1. GTM ID kahan daalna hai

Do jagah, koi ek kaafi hai:

1. **Admin panel:** Settings → **Tracking** → `Google Tag Manager ID` (jaise `GTM-ABC1234`). Ye pehle dekha jaata hai.
2. Ya `.env` file me: `NEXT_PUBLIC_GTM_ID=GTM-ABC1234` (server restart ke baad).

**Agar ID khali hai to website kuch bhi load nahi karti** (na GTM, na cookie banner). Jab ID daalte hain, tab cookie banner apne aap dikhne lagta hai.

## 2. Cookie banner aur Consent Mode v2

- Banner English aur Hindi dono me hai. Visitor ke accept karne tak **analytics aur ads dono `denied`** rehte hain.
- Visitor ki pasand browser me `localStorage` key `shrim_consent` me save hoti hai. Footer ke **Cookie settings** se wo pasand badal sakta hai.
- Website ye Consent Mode signals bhejti hai: `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`
  (default `denied`; accept par `granted`). `functionality_storage` aur `security_storage` hamesha `granted`.
- Jab visitor choice karta hai tab ek `consent_update` event bhi jaata hai (neeche table me).

**GTM me kya karna hai:** har tag me **Advanced Settings → Consent Settings → Require additional consent** set kijiye:

| Tag | Required consent |
|---|---|
| GA4 Configuration / GA4 events | `analytics_storage` |
| Google Ads conversion / remarketing | `ad_storage`, `ad_user_data` |
| Meta Pixel | `ad_storage` |
| Microsoft Clarity | `analytics_storage` |

(Google ke tags built-in consent check karte hain, phir bhi ye set kar dena achha hai. Meta Pixel aur Clarity ke liye ye zaroori hai.)

---

## 3. Saare events aur unke parameters

Har event ek **Custom Event** trigger se pakda jaata hai (trigger me *Event name* wahi likhiye jo neeche hai).

| Event name | Kab fire hota hai | Parameters |
|---|---|---|
| `generate_lead` | Koi bhi form successfully submit hone par (site-visit, calculator, home/service/contact ka short form) | `form_name`, `service`, `source_page`, `lead_score_band`, `event_id` |
| `site_visit_booked` | Sirf `/site-visit` ka multi-step form submit hone par (`generate_lead` ke saath) | `service`, `source_page`, `lead_score_band`, `event_id` |
| `calculator_complete` | Cost calculator ka result pehli baar dikhne par (home ke teaser se aaye to bhi) | `service`, `tier`, `source_page` |
| `whatsapp_click` | Kisi bhi WhatsApp button par click (header, sticky bar, floating button, thank-you) | `page_path` |
| `call_click` | Kisi bhi Call button / phone link par click | `page_path` |
| `cta_click` | "Book a Free Site Visit", "Calculate Cost", service cards jaise main buttons par click | `page_path`, `button_label` |
| `consent_update` | Visitor cookie banner me choice karta hai | `analytics_storage` (`granted`/`denied`), `ad_storage` (`granted`/`denied`) |

### Parameters ka matlab

| Parameter | Values / example |
|---|---|
| `form_name` | `site_visit`, `calculator`, `quick_home`, `quick_service-page`, `quick_contact` |
| `service` | `house-construction`, `interior`, `renovation`, `fabrication`, `turnkey`, `not-sure`. Calculator me: `new-construction`, `renovation`, `interior` |
| `source_page` / `page_path` | Page ka path, jaise `/services/interior` ya `/hi/contact` |
| `lead_score_band` | `hot`, `warm`, `cold` (lead score se auto) |
| `event_id` | Lead reference number, jaise `SHR-2026-0007`. **Meta ke deduplication ke liye zaroori** (neeche dekhiye) |
| `tier` | `basic`, `standard`, `premium` |
| `button_label` | Button par likha text, jaise `Book a Free Site Visit` |

Call aur WhatsApp clicks me `button_label` **nahi** bheja jaata, kyunki button par phone number likha hota hai.

---

## 4. GTM me variables banaiye (ek baar)

**Variables → New → Data Layer Variable** (Version 2). Naam aap kuch bhi rakh sakte hain; ye suggestion hai:

| Variable name | Data Layer Variable Name |
|---|---|
| `DLV - form_name` | `form_name` |
| `DLV - service` | `service` |
| `DLV - source_page` | `source_page` |
| `DLV - lead_score_band` | `lead_score_band` |
| `DLV - event_id` | `event_id` |
| `DLV - button_label` | `button_label` |
| `DLV - tier` | `tier` |

## 5. GA4 setup

1. GA4 me ek Web Data Stream banaiye. **Measurement ID** (`G-XXXXXXX`) copy kijiye.
2. GTM → Tags → New → **Google Tag** → Tag ID = aapka `G-XXXXXXX` → Trigger: **All Pages** → Consent: `analytics_storage`.
3. Har event ke liye ek **GA4 Event** tag banaiye (Configuration tag = upar wala Google Tag):
   - Event name `generate_lead`, trigger = Custom Event `generate_lead`. Parameters: `form_name`, `service`, `lead_score_band` (variables se).
   - Isi tarah `site_visit_booked`, `calculator_complete`, `whatsapp_click`, `call_click`, `cta_click`.
4. GA4 me **Admin → Events** me `generate_lead` ko **Key event** mark kijiye (ye aapki main conversion hai). `site_visit_booked` ko bhi chahein to mark kijiye.
5. Custom dimensions chahiye to GA4 → Admin → Custom definitions me `service`, `lead_score_band`, `form_name` banaiye (Event scope).

Page change (Next.js me page reload nahi hota): GA4 ka **Enhanced measurement → Page changes based on browser history events** ON rakhiye, ya GTM me **History Change** trigger se page_view bhejiye.

## 6. Google Ads conversion

1. Google Ads → Goals → Conversions → New → **Website** → category **Submit lead form** (ya Book appointment).
2. Setup **Use Google Tag Manager** chuniye. Aapko **Conversion ID** aur **Conversion Label** milega.
3. GTM → New tag → **Google Ads Conversion Tracking** → ID aur Label daaliye. Trigger = Custom Event **`generate_lead`**.
   Consent: `ad_storage`, `ad_user_data`.
4. Tag me **Conversion Value** me kuch dena zaroori nahi.
5. Ek **Google Ads Remarketing** tag (All Pages) bhi laga sakte hain.

Alternative: aap `/thank-you` page ko conversion URL maan sakte hain (Page View trigger, path `/thank-you` ya `/hi/thank-you`).
Lekin **event wala tareeka behtar hai**, kyunki wo Consent Mode ke saath sahi chalta hai aur ek hi lead ko do baar nahi ginta.

## 7. Meta Pixel (Facebook / Instagram ads)

1. Meta Events Manager me Pixel banaiye, **Pixel ID** copy kijiye.
2. GTM → New tag → **Custom HTML** (ya Community Template Gallery se "Facebook Pixel") → Meta ka base code → Trigger **All Pages** → Consent: `ad_storage`.
3. Lead event ke liye ek aur Custom HTML tag, Trigger = Custom Event `generate_lead`:

   ```html
   <script>
     fbq('track', 'Lead',
       { content_category: {{DLV - service}}, lead_band: {{DLV - lead_score_band}} },
       { eventID: {{DLV - event_id}} });
   </script>
   ```

4. Site visit ke liye Custom Event `site_visit_booked` par:

   ```html
   <script>fbq('track', 'Schedule', {}, { eventID: {{DLV - event_id}} });</script>
   ```

`eventID` me **lead reference number** jaata hai. Server se bhejne wale Conversions API (neeche) me bhi yehi ID hoti hai, isliye Meta
dono ko ek hi lead ginta hai (duplicate nahi).

## 8. Microsoft Clarity (free heatmaps)

Clarity me project banaiye → **Project ID** copy kijiye → GTM → Custom HTML tag me Clarity ka code → Trigger **All Pages** → Consent: `analytics_storage`.
Clarity me phone number ya email wale form fields apne aap mask ho jaate hain (Settings → Masking me check kar lijiye).

---

## 9. Meta Conversions API (server se, abhi band hai)

Website ek helper rakhti hai jo lead banne par Meta ko server se bhi `Lead` (aur site visit par `Schedule`) event bhej sakta hai.
Ye browser blockers ke bawajood conversions ginne me madad karta hai.

**Abhi ye band hai.** Ye tabhi chalega jab teeno cheezein hon:

1. `.env` me `META_CAPI_ENABLED=true`
2. `META_PIXEL_ID=...` (ya Admin → Settings → Tracking me Meta Pixel ID) aur `META_CAPI_TOKEN=...` (Events Manager → Settings → Conversions API → Generate access token)
3. Visitor ne cookie banner me **advertising cookies accept** kiye hon (website ye `shrim_ads_consent` cookie se jaanti hai)

Safety:

- Phone, email aur first name **SHA-256 se hash** hokar jaate hain, plain text me nahi.
- Consent nahi hai to kuch nahi jaata.
- Testing ke liye Events Manager ka **Test Event Code** `META_CAPI_TEST_CODE=TEST12345` me daaliye. Event "Test events" tab me dikhega.
- Koi bhi error aaye to lead par asar nahi padta. Bas error server log me dikhta hai.

---

## 10. Test kaise karein (GTM Preview)

1. GTM → **Preview** → apni site ka URL (`http://localhost:3000` ya live URL) daaliye → Connect.
2. Site par cookie banner dikhna chahiye. Pehle kuch bhi accept na kijiye. Tag Assistant me **Consent** tab me sab `Denied` hona chahiye.
3. **Accept all** dabaiye. `consent_update` event aana chahiye aur Consent tab me `Granted` dikhna chahiye.
4. Contact page par apne number se form bhariye. `generate_lead` event aana chahiye. Event ke **Data Layer** tab me `form_name`, `service`, `lead_score_band`, `event_id` dikhne chahiye.
5. Check kijiye ki dataLayer me aapka naam ya phone number **kahin nahi** hai.
6. GA4 → Reports → **Realtime** me event dikhna chahiye (Google Tag Assistant ke saath).
7. Test lead admin se delete kar dijiye.

## Quick reference: files

| Kaam | File |
|---|---|
| Events push karna | `src/lib/track.ts` |
| Click events (`cta_click`, `call_click`, `whatsapp_click`) | `src/components/ClientBoot.tsx` (buttons par `data-track="..."`) |
| GTM + Consent Mode default | `src/components/Tracking.tsx` |
| Cookie banner | `src/components/ConsentBanner.tsx` |
| Meta Conversions API | `src/lib/meta-capi.ts` |
