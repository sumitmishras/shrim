# Telegram Alert Setup (Hinglish)

Jab bhi website par koi naya lead aata hai, aapke Telegram par turant ek message aayega:
naam, phone number, service, locality, budget, timeline, source, score (Hot / Warm / Cold) aur admin ka link.

Ye free hai. Bas 5 minute lagte hain. Aapko do cheezein chahiye:

- **Bot Token** (bot ka password)
- **Chat ID** (aapka Telegram account / group ka number)

---

## Step 1: Bot banaiye (BotFather se)

1. Telegram kholiye aur search me **@BotFather** dhundhiye. Naam ke saath blue tick hona chahiye.
2. **Start** dabaiye, phir ye likh kar bhejiye: `/newbot`
3. BotFather bot ka **naam** poochega. Kuch bhi likh sakte hain, jaise: `SHRIM Leads`
4. Phir bot ka **username** poochega. Ye `bot` par khatam hona chahiye aur unique hona chahiye, jaise: `shrim_leads_bot`
   (agar "already taken" aaye to koi aur naam try kijiye, jaise `shrim_enquiry_bot`)
5. BotFather ek lamba message bhejega jisme **token** hoga. Aisa dikhta hai:

   ```
   123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   Is poore token ko copy kar lijiye. **Ye password hai. Kisi ko mat dijiye, WhatsApp ya email par mat bhejiye.**

## Step 2: Apne bot ko ek message bhejiye

Ye step zaroori hai. Jab tak aap bot ko pehle message nahi karte, bot aapko message nahi bhej sakta.

1. BotFather ke message me `t.me/shrim_leads_bot` jaisa link hoga. Us par click kijiye.
2. **Start** dabaiye aur `hello` likh kar bhej dijiye.

## Step 3: Chat ID nikaliye

**Tarika A: apne personal Telegram par alert chahiye (sabse aasan)**

1. Browser me ye link kholiye (apna token daal kar, `<TOKEN>` ki jagah):

   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```

   Example: `https://api.telegram.org/bot123456789:AAHxxxx/getUpdates`
2. Page par kuch aisa text dikhega:

   ```
   "chat":{"id":987654321,"first_name":"Rahul", ...
   ```

3. `"id":` ke baad ka number (yahan `987654321`) hi aapka **Chat ID** hai.
4. Agar page par `"result":[]` (khali) dikhe, to Step 2 dobara kijiye (bot ko `hello` bhejiye) aur page refresh kijiye.

**Tarika B: team ke group me alert chahiye**

1. Telegram me ek naya group banaiye aur apne bot ko us group me add kijiye.
2. Group me koi bhi message likhiye, jaise `hi`.
3. Upar wala `getUpdates` link dobara kholiye.
4. Is baar chat id **minus (-) se shuru** hoga, jaise `-1001234567890`. Minus ke saath poora number copy kijiye.

## Step 4: Dono values `.env` file me daaliye

1. Project folder `shrim/app` kholiye. Wahan `.env` naam ki file hai.
   (Ye hidden file hai. Mac Finder me **Cmd + Shift + .** dabaiye, ya VS Code me dekhiye.)
2. Is file me ye do lines dhundhiye (agar nahi hain to neeche jod dijiye) aur apni values likh dijiye:

   ```
   TELEGRAM_BOT_TOKEN=123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TELEGRAM_CHAT_ID=987654321
   ```

   - `=` ke baad koi space nahi, koi inverted commas (`" "`) nahi.
   - Group ka chat id ho to minus ke saath likhiye: `TELEGRAM_CHAT_ID=-1001234567890`
3. File save kijiye.
4. Server restart kijiye (terminal me `Ctrl + C`, phir `npm run dev`). `.env` me badlav restart ke baad hi kaam karta hai.

> Live server par bhi yahi do lines server wali `.env` file me daalni hongi. Wo `DEPLOY.md` me bataya jayega.

## Step 5: Test kijiye

1. Website par `http://localhost:3000/contact` kholiye.
2. Form bhariye (apna hi number daaliye), consent tick kijiye aur submit kijiye.
3. Kuch second me Telegram par message aa jana chahiye.

Message aisa dikhega:

```
🔔 New lead SHR-2026-0001  🔥 HOT (91)
👤 Rahul
📞 +91 9876543210
🛠 House Construction
📍 Chinhat · 1800 sq ft · 2 floor(s)
💰 ₹25–50 lakh · ⏱ Immediately
🔗 Site visit form · google-ads
👉 http://localhost:3000/admin/collections/leads/12
```

Phone number par tap karke seedha call kar sakte hain.

Testing ke baad admin me jaakar test lead delete kar dijiye (Leads se).

---

## Agar message nahi aaya

| Problem | Kya karein |
|---|---|
| Kuch bhi nahi aaya | Server terminal dekhiye. Agar `TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set` likha hai, to `.env` me values nahi mili. Spelling check kijiye aur server restart kijiye. |
| Terminal me `send failed: HTTP 401` | Token galat hai. BotFather se dobara copy kijiye. Poora token chahiye, `:` ke saath. |
| Terminal me `send failed: HTTP 400 ... chat not found` | Chat ID galat hai, ya aapne bot ko pehle `hello` nahi bheja (Step 2). Group ho to bot group me add hona chahiye. |
| `getUpdates` me `"result":[]` | Bot ko Telegram par ek message bhejiye aur page refresh kijiye. |

**Zaroori baat:** Agar Telegram band ho ya token galat ho, tab bhi lead admin panel me save hoti hai. Customer ko kuch problem nahi dikhti. Sirf aapko alert nahi milta. Isliye admin me **Leads** kabhi-kabhi check karte rahiye.

## Token leak ho gaya to?

BotFather me `/mybots` likhiye, apna bot chuniye, **API Token** par jaiye aur **Revoke current token** dabaiye. Naya token milega. Use `.env` me badal dijiye.
