/**
 * Draft copy for first launch. English + Hindi (simple, spoken Lucknow style, English words kept where people use them).
 * The owner edits everything in the admin panel. The seed script never overwrites existing entries.
 * No claims about projects, clients, ratings or awards are made here.
 */
export type L<T> = { en: T; hi: T }
type Tier = { tier: 'basic' | 'standard' | 'premium'; label: string; description: string }

const tierLabels = {
  en: { basic: 'Basic', standard: 'Standard', premium: 'Premium' },
  hi: { basic: 'बेसिक', standard: 'स्टैंडर्ड', premium: 'प्रीमियम' },
}
const tiers = (en: [string, string, string], hi: [string, string, string]): L<Tier[]> => {
  const keys = ['basic', 'standard', 'premium'] as const
  return {
    en: keys.map((k, i) => ({ tier: k, label: tierLabels.en[k], description: en[i] })),
    hi: keys.map((k, i) => ({ tier: k, label: tierLabels.hi[k], description: hi[i] })),
  }
}

export type SeedService = {
  slug: string; order: number
  title: L<string>; summary: L<string>; heroHeadline: L<string>; heroSub: L<string>
  painPoints: L<{ title: string; text: string }[]>
  inclusions: L<{ text: string }[]>
  tiers: L<Tier[]>
  metaTitle: L<string>; metaDescription: L<string>
  faqs: L<{ q: string; a: string }[]>
}

export const services: SeedService[] = [
  {
    slug: 'house-construction', order: 1,
    title: { en: 'House Construction', hi: 'घर निर्माण' },
    summary: { en: 'Your complete house, built by one team – from naksha to chaabi.', hi: 'पूरा घर, एक ही टीम के हाथों – नक्शे से चाबी तक।' },
    heroHeadline: { en: 'Build your house in Lucknow – from naksha to chaabi, one team.', hi: 'लखनऊ में अपना घर बनवाइए – नक्शे से चाबी तक, एक ही टीम।' },
    heroSub: {
      en: 'Complete civil construction for plot owners in east Lucknow. A clear estimate, weekly photo updates, and one team answerable for the whole job.',
      hi: 'पूर्वी लखनऊ के प्लॉट मालिकों के लिए पूरा सिविल काम। साफ़ estimate, हर हफ़्ते फ़ोटो अपडेट, और पूरे काम की ज़िम्मेदारी एक ही टीम की।',
    },
    painPoints: {
      en: [
        { title: 'The estimate keeps growing', text: 'You get a detailed, item-wise estimate before you sign, so there are fewer surprises later.' },
        { title: 'Work slows down or stops midway', text: 'One accountable team, a written schedule and weekly photo updates, so you always know where the work stands.' },
        { title: 'You cannot be on site every day', text: 'A supervisor on site and photos every week let you follow the work from wherever you are.' },
        { title: 'Map approval and papers feel confusing', text: 'We guide you through the LDA naksha approval process and the documents you will need.' },
      ],
      hi: [
        { title: 'Estimate बढ़ता ही जाता है', text: 'साइन करने से पहले आपको एक-एक चीज़ का estimate मिलता है, ताकि बाद में अचानक खर्चा न निकले।' },
        { title: 'काम बीच में धीमा पड़ जाता है या रुक जाता है', text: 'एक ही टीम की ज़िम्मेदारी, लिखित schedule और हर हफ़्ते फ़ोटो अपडेट – आपको हमेशा पता रहता है कि काम कहाँ तक पहुँचा।' },
        { title: 'रोज़ साइट पर जाना मुमकिन नहीं', text: 'साइट पर supervisor रहता है और हर हफ़्ते फ़ोटो मिलती हैं, आप कहीं से भी काम देख सकते हैं।' },
        { title: 'नक्शा पास कराना और कागज़ात समझ नहीं आते', text: 'LDA से नक्शा पास कराने की प्रक्रिया और ज़रूरी कागज़ात में हम आपको पूरा रास्ता बताते हैं।' },
      ],
    },
    inclusions: {
      en: ['Free site visit and plot assessment', 'Detailed item-wise estimate', 'Foundation, columns, slabs and brickwork', 'Electrical and plumbing work', 'Plaster, flooring, tiling and painting', 'Doors, windows and basic fabrication', 'Weekly photo updates', 'Final walkthrough and handover'].map((text) => ({ text })),
      hi: ['फ्री साइट विज़िट और प्लॉट की जाँच', 'एक-एक चीज़ का पूरा estimate', 'नींव, कॉलम, छत (slab) और ईंट की चिनाई', 'इलेक्ट्रिकल और प्लंबिंग का काम', 'प्लास्टर, फ़्लोरिंग, टाइलिंग और पेंट', 'दरवाज़े, खिड़कियाँ और ज़रूरी फैब्रिकेशन', 'हर हफ़्ते फ़ोटो अपडेट', 'आख़िरी walkthrough और चाबी हैंडओवर'].map((text) => ({ text })),
    },
    tiers: tiers(
      ['Sound structure with practical, budget-friendly finishing.', 'A balanced choice between cost and finish.', 'High-end finishes and fittings for a premium look.'],
      ['मज़बूत structure और बजट के हिसाब से काम चलाऊ finishing।', 'खर्चे और finishing के बीच संतुलित चुनाव।', 'ऊँचे दर्जे की finishing और fittings, premium look के लिए।'],
    ),
    metaTitle: { en: 'House Construction in Lucknow | SHRIM', hi: 'लखनऊ में घर निर्माण | SHRIM' },
    metaDescription: {
      en: 'House construction in Lucknow by one accountable team. Free site visit, clear estimate and weekly photo updates. Serving Gomti Nagar Extension, Chinhat, Faizabad Road and more.',
      hi: 'लखनऊ में घर निर्माण, एक ही ज़िम्मेदार टीम के साथ। फ्री साइट विज़िट, साफ़ estimate और हर हफ़्ते फ़ोटो अपडेट। गोमती नगर एक्सटेंशन, चिनहट, फ़ैज़ाबाद रोड और आसपास।',
    },
    faqs: {
      en: [
        { q: 'How much does it cost to build a house per sq ft in Lucknow?', a: 'It depends on the size, number of floors and the quality of finishing you choose. Use our cost calculator for a quick range. The exact figure comes after a free site visit.' },
        { q: 'Do I need to buy the materials myself?', a: 'No. We handle material purchase as agreed in the estimate. If you want to supply something yourself, tell us at the site visit and we will note it in writing.' },
        { q: 'Can you build on a plot where the map is not yet approved?', a: 'We recommend starting only after approval. We guide you on the LDA process and documents so you can get it done properly first.' },
        { q: 'How will I know how the work is going?', a: 'You receive photo updates every week, and you are welcome to visit the site any time.' },
      ],
      hi: [
        { q: 'लखनऊ में घर बनवाने का प्रति sq ft खर्चा कितना आता है?', a: 'यह घर के साइज़, मंज़िलों की संख्या और finishing की क्वालिटी पर निर्भर करता है। जल्दी अंदाज़ा लेने के लिए हमारा cost calculator इस्तेमाल करें। सही खर्चा फ्री साइट विज़िट के बाद बताया जाता है।' },
        { q: 'क्या सामान मुझे ख़ुद ख़रीदना पड़ेगा?', a: 'नहीं। estimate में जैसा तय होता है, सामान हम ख़रीदते हैं। अगर आप कुछ ख़ुद देना चाहें तो साइट विज़िट पर बता दीजिए, हम उसे लिखित में दर्ज कर लेंगे।' },
        { q: 'अगर नक्शा अभी पास नहीं हुआ तो क्या काम शुरू कर सकते हैं?', a: 'हमारी सलाह है कि पास होने के बाद ही शुरू करें। LDA की प्रक्रिया और कागज़ात में हम आपको रास्ता बताते हैं, ताकि पहले यह काम ठीक से हो जाए।' },
        { q: 'काम कैसा चल रहा है, यह मुझे कैसे पता चलेगा?', a: 'आपको हर हफ़्ते फ़ोटो अपडेट मिलता है, और आप जब चाहें साइट पर आ सकते हैं।' },
      ],
    },
  },
  {
    slug: 'interior', order: 2,
    title: { en: 'Interior Works', hi: 'इंटीरियर' },
    summary: { en: 'Kitchens, wardrobes, ceilings and woodwork that fit your home and budget.', hi: 'किचन, अलमारी, सीलिंग और लकड़ी का काम – आपके घर और बजट के हिसाब से।' },
    heroHeadline: { en: 'Interiors that fit your home and your budget.', hi: 'आपके घर और बजट के हिसाब से इंटीरियर।' },
    heroSub: {
      en: 'From modular kitchens to complete home interiors – planned on your actual measurements and finished by one team.',
      hi: 'मॉड्यूलर किचन से लेकर पूरे घर के इंटीरियर तक – आपके घर की असली नाप पर प्लान, और काम एक ही टीम से।',
    },
    painPoints: {
      en: [
        { title: 'The design looks great, the final work does not match', text: 'We plan on real site measurements and agree the finish and materials in writing before work starts.' },
        { title: 'Too many people to manage', text: 'Carpenter, electrician, painter – our team coordinates all of it, so you deal with one point of contact.' },
        { title: 'The budget goes out of control', text: 'You get an item-wise estimate first. Any change is discussed with you before it is done.' },
      ],
      hi: [
        { title: 'Design में कुछ और दिखता है, काम कुछ और निकलता है', text: 'हम साइट की असली नाप पर प्लान करते हैं, और काम शुरू होने से पहले finish और सामान लिखित में तय कर लेते हैं।' },
        { title: 'बहुत सारे लोगों को सँभालना पड़ता है', text: 'कारपेंटर, इलेक्ट्रीशियन, पेंटर – सबका तालमेल हमारी टीम करती है, आपको बस एक ही आदमी से बात करनी है।' },
        { title: 'बजट हाथ से निकल जाता है', text: 'पहले आपको एक-एक चीज़ का estimate मिलता है। कोई भी बदलाव करने से पहले आपसे पूछा जाता है।' },
      ],
    },
    inclusions: {
      en: ['Site measurement and layout planning', 'Modular kitchen and wardrobes', 'False ceiling and lighting', 'Wall finishes and painting', 'Furniture and woodwork', 'Final cleaning and handover'].map((text) => ({ text })),
      hi: ['साइट की नाप और layout प्लानिंग', 'मॉड्यूलर किचन और अलमारियाँ', 'फॉल्स सीलिंग और लाइटिंग', 'दीवारों की finishing और पेंट', 'फ़र्नीचर और लकड़ी का काम', 'आख़िरी सफ़ाई और हैंडओवर'].map((text) => ({ text })),
    },
    tiers: tiers(
      ['Practical interiors with durable, budget-friendly materials.', 'Better materials and finishes for everyday comfort.', 'Premium materials, custom design and detailed finishing.'],
      ['टिकाऊ और बजट वाले सामान से काम की चीज़ें।', 'रोज़ के आराम के लिए बेहतर सामान और finishing।', 'प्रीमियम सामान, अपनी पसंद का design और बारीक finishing।'],
    ),
    metaTitle: { en: 'Interior Works in Lucknow | SHRIM', hi: 'लखनऊ में इंटीरियर का काम | SHRIM' },
    metaDescription: {
      en: 'Home interiors in Lucknow – modular kitchens, wardrobes, ceilings and woodwork by one team. Book a free site visit.',
      hi: 'लखनऊ में घर का इंटीरियर – मॉड्यूलर किचन, अलमारी, सीलिंग और लकड़ी का काम, एक ही टीम से। फ्री साइट विज़िट बुक करें।',
    },
    faqs: {
      en: [
        { q: 'Can you do interiors for a house you did not build?', a: 'Yes. We work on any home. We start with a site visit and take measurements.' },
        { q: 'Do you do only part of the work, like just the kitchen?', a: 'Yes. You can book a single kitchen, wardrobe or room, or the complete home.' },
        { q: 'Will I see the design before work starts?', a: 'Yes. Layout and finish are shared and agreed with you before the work begins.' },
        { q: 'How long does a full interior take?', a: 'It depends on the size and scope of the work. We give you a written schedule after the site visit.' },
      ],
      hi: [
        { q: 'जो घर आपने नहीं बनाया, उसका इंटीरियर भी कर देंगे?', a: 'जी हाँ, किसी भी घर में काम करते हैं। पहले साइट विज़िट होती है और नाप ली जाती है।' },
        { q: 'क्या सिर्फ़ किचन जैसा थोड़ा-सा काम भी होता है?', a: 'जी हाँ। आप सिर्फ़ किचन, अलमारी या एक कमरा भी करवा सकते हैं, या पूरा घर।' },
        { q: 'क्या काम शुरू होने से पहले design दिखाया जाएगा?', a: 'जी हाँ। काम शुरू होने से पहले layout और finish आपको दिखाकर आपसे तय कर लिया जाता है।' },
        { q: 'पूरे घर के इंटीरियर में कितना समय लगता है?', a: 'यह घर के साइज़ और काम पर निर्भर करता है। साइट विज़िट के बाद आपको लिखित में schedule दिया जाता है।' },
      ],
    },
  },
  {
    slug: 'renovation', order: 3,
    title: { en: 'Renovation', hi: 'रेनोवेशन' },
    summary: { en: 'Repair, refresh and upgrade your existing home without the headache.', hi: 'पुराने घर की मरम्मत, नया रूप और अपग्रेड – बिना सिरदर्द के।' },
    heroHeadline: { en: 'Renovate your home without the headache.', hi: 'घर का रेनोवेशन करवाइए, बिना सिरदर्द के।' },
    heroSub: {
      en: 'Seepage, cracks, old flooring, tired bathrooms – we inspect first, tell you what is really needed, and fix it properly.',
      hi: 'सीलन, दरारें, पुराना फ़र्श, पुराने बाथरूम – हम पहले जाँच करते हैं, बताते हैं कि असल में क्या ज़रूरी है, और ठीक से काम करते हैं।',
    },
    painPoints: {
      en: [
        { title: 'Living in the house while work goes on', text: 'We plan the work in stages and keep the site tidy, so daily life is disturbed as little as possible.' },
        { title: 'Hidden problems appear after you start', text: 'We inspect for seepage, cracks and old wiring first, so you know what you are dealing with.' },
        { title: 'Not sure how much to spend', text: 'We tell you what is urgent and what can wait, with an estimate for each part.' },
      ],
      hi: [
        { title: 'घर में रहते हुए काम करवाना पड़ता है', text: 'हम काम हिस्सों में प्लान करते हैं और साइट साफ़ रखते हैं, ताकि रोज़ की ज़िंदगी कम से कम परेशान हो।' },
        { title: 'काम शुरू करने के बाद छुपी हुई दिक़्क़तें निकलती हैं', text: 'पहले सीलन, दरारें और पुरानी वायरिंग की जाँच करते हैं, ताकि आपको पहले से पता हो कि क्या करना है।' },
        { title: 'समझ नहीं आता कितना खर्चा करें', text: 'हम बताते हैं कि क्या अभी ज़रूरी है और क्या बाद में हो सकता है, हर हिस्से का अलग estimate देकर।' },
      ],
    },
    inclusions: {
      en: ['Site inspection and problem check', 'Seepage and crack repair', 'Flooring and tiling', 'Bathroom and kitchen renovation', 'Plaster and repainting', 'Electrical and plumbing replacement', 'Adding rooms or a floor where the structure allows'].map((text) => ({ text })),
      hi: ['साइट की जाँच और दिक़्क़तों की पहचान', 'सीलन और दरारों की मरम्मत', 'फ़्लोरिंग और टाइलिंग', 'बाथरूम और किचन का रेनोवेशन', 'प्लास्टर और दोबारा पेंट', 'इलेक्ट्रिकल और प्लंबिंग बदलना', 'जहाँ structure इजाज़त दे, वहाँ कमरा या मंज़िल बढ़ाना'].map((text) => ({ text })),
    },
    tiers: tiers(
      ['Essential repairs and refresh at the lowest cost.', 'Repairs plus better finishes and fittings.', 'A full upgrade with premium finishes and fittings.'],
      ['ज़रूरी मरम्मत और नया रंग-रूप, सबसे कम खर्चे में।', 'मरम्मत के साथ बेहतर finishing और fittings।', 'प्रीमियम finishing और fittings के साथ पूरा अपग्रेड।'],
    ),
    metaTitle: { en: 'Home Renovation in Lucknow | SHRIM', hi: 'लखनऊ में घर का रेनोवेशन | SHRIM' },
    metaDescription: {
      en: 'Home renovation in Lucknow – repairs, flooring, bathrooms, kitchens and repainting. We inspect first and give a clear estimate. Free site visit.',
      hi: 'लखनऊ में घर का रेनोवेशन – मरम्मत, फ़्लोरिंग, बाथरूम, किचन और पेंट। पहले जाँच, फिर साफ़ estimate। फ्री साइट विज़िट।',
    },
    faqs: {
      en: [
        { q: 'Can we stay in the house during renovation?', a: 'In many cases yes, if the work is planned in stages. We discuss this at the site visit.' },
        { q: 'Renovate or rebuild – how do I decide?', a: 'It depends on the condition of the structure. We inspect and give you an honest opinion. You can also read our guide on this.' },
        { q: 'Do you fix seepage permanently?', a: 'We find the cause first and treat it. The method and terms are explained in the estimate.' },
        { q: 'Can you renovate just one floor or one room?', a: 'Yes. Small and large jobs are both fine.' },
      ],
      hi: [
        { q: 'क्या रेनोवेशन के दौरान घर में रह सकते हैं?', a: 'ज़्यादातर मामलों में हाँ, अगर काम हिस्सों में प्लान किया जाए। यह बात साइट विज़िट पर तय हो जाती है।' },
        { q: 'रेनोवेशन करवाएँ या नया बनवाएँ – कैसे तय करें?', a: 'यह structure की हालत पर निर्भर करता है। हम जाँचकर आपको सच्ची राय देते हैं। इस पर हमारा गाइड भी पढ़ सकते हैं।' },
        { q: 'क्या सीलन हमेशा के लिए ठीक हो जाती है?', a: 'पहले हम वजह ढूँढते हैं, फिर इलाज करते हैं। तरीक़ा और शर्तें estimate में समझाई जाती हैं।' },
        { q: 'क्या सिर्फ़ एक मंज़िल या एक कमरे का काम हो सकता है?', a: 'जी हाँ। छोटा और बड़ा, दोनों काम करते हैं।' },
      ],
    },
  },
  {
    slug: 'fabrication', order: 4,
    title: { en: 'Fabrication', hi: 'फैब्रिकेशन' },
    summary: { en: 'Gates, grills, railings and structural steel, made to measure.', hi: 'गेट, ग्रिल, रेलिंग और स्ट्रक्चरल स्टील – नाप के हिसाब से।' },
    heroHeadline: { en: 'Gates, grills, railings and steel work – made to measure.', hi: 'गेट, ग्रिल, रेलिंग और स्टील का काम – नाप के हिसाब से।' },
    heroSub: {
      en: 'Fabrication for homes and commercial sites, measured on site, made carefully and fixed properly.',
      hi: 'घरों और दुकानों-दफ़्तरों के लिए फैब्रिकेशन – साइट पर नाप, ध्यान से बनाना और ठीक से लगाना।',
    },
    painPoints: {
      en: [
        { title: 'The gate or grill does not fit', text: 'We measure on site before making anything, so the work fits.' },
        { title: 'Weak welding and early rusting', text: 'Careful welding and proper finishing are part of the job, not an extra.' },
        { title: 'Small jobs get delayed', text: 'We give a clear delivery date and tell you if anything changes.' },
      ],
      hi: [
        { title: 'गेट या ग्रिल ठीक से फ़िट नहीं होती', text: 'कुछ भी बनाने से पहले हम साइट पर नाप लेते हैं, इसलिए काम फ़िट बैठता है।' },
        { title: 'वेल्डिंग कमज़ोर और जल्दी जंग लगना', text: 'ध्यान से वेल्डिंग और ठीक से finishing काम का हिस्सा है, अलग से नहीं।' },
        { title: 'छोटे काम में देरी हो जाती है', text: 'हम डिलीवरी की साफ़ तारीख़ बताते हैं, और कुछ बदले तो आपको बताते हैं।' },
      ],
    },
    inclusions: {
      en: ['Main gates and boundary gates', 'Window and safety grills', 'Staircase and balcony railings', 'Sheds and structural steel work', 'Measurement and design', 'Fixing at site and finishing'].map((text) => ({ text })),
      hi: ['मेन गेट और बाउंड्री गेट', 'खिड़की और सुरक्षा ग्रिल', 'सीढ़ी और बालकनी की रेलिंग', 'शेड और स्ट्रक्चरल स्टील का काम', 'नाप और design', 'साइट पर फ़िटिंग और finishing'].map((text) => ({ text })),
    },
    tiers: tiers(
      ['Simple, sturdy designs at an economical price.', 'More design options and a better finish.', 'Custom designs and premium finish.'],
      ['सादे और मज़बूत design, किफ़ायती दाम में।', 'ज़्यादा design के विकल्प और बेहतर finish।', 'अपनी पसंद का design और प्रीमियम finish।'],
    ),
    metaTitle: { en: 'Fabrication Work in Lucknow – Gates, Grills, Railings | SHRIM', hi: 'लखनऊ में फैब्रिकेशन – गेट, ग्रिल, रेलिंग | SHRIM' },
    metaDescription: {
      en: 'Gates, grills, railings and structural steel fabrication in Lucknow. Measured on site and fixed properly. Request a free site visit.',
      hi: 'लखनऊ में गेट, ग्रिल, रेलिंग और स्ट्रक्चरल स्टील फैब्रिकेशन। साइट पर नाप और ठीक से फ़िटिंग। फ्री साइट विज़िट माँगें।',
    },
    faqs: {
      en: [
        { q: 'Do you take small fabrication jobs?', a: 'Yes. A single gate or grill is fine.' },
        { q: 'Can I choose the design?', a: 'Yes. Share a photo or idea and we will suggest what is possible within your budget.' },
        { q: 'Do you fix the work at the site?', a: 'Yes. Measurement, making and fixing are all done by our team.' },
        { q: 'How do you give the price?', a: 'The price is given after we measure and understand the design. It is written in the estimate.' },
      ],
      hi: [
        { q: 'क्या छोटा फैब्रिकेशन का काम भी लेते हैं?', a: 'जी हाँ। सिर्फ़ एक गेट या ग्रिल का काम भी हो जाता है।' },
        { q: 'क्या design मैं ख़ुद चुन सकता हूँ?', a: 'जी हाँ। आप फ़ोटो या आइडिया दिखाइए, हम बताएँगे कि आपके बजट में क्या हो सकता है।' },
        { q: 'क्या साइट पर फ़िटिंग भी आप ही करते हैं?', a: 'जी हाँ। नाप, बनाना और लगाना, तीनों हमारी टीम करती है।' },
        { q: 'दाम कैसे बताते हैं?', a: 'नाप लेने और design समझने के बाद दाम बताया जाता है, और वह estimate में लिखित होता है।' },
      ],
    },
  },
  {
    slug: 'turnkey', order: 5,
    title: { en: 'Turnkey & Project Management', hi: 'टर्नकी व प्रोजेक्ट मैनेजमेंट' },
    summary: { en: 'You decide. We manage the whole project and hand over the keys.', hi: 'फ़ैसला आपका, पूरा प्रोजेक्ट हमारा – और आख़िर में चाबी आपके हाथ में।' },
    heroHeadline: { en: 'Turnkey: you decide, we manage everything.', hi: 'टर्नकी: फ़ैसला आपका, बाक़ी सब हमारा।' },
    heroSub: {
      en: 'Civil, interiors and fabrication under one agreement, with one person to call and weekly photo updates.',
      hi: 'सिविल, इंटीरियर और फैब्रिकेशन एक ही agreement में, बात करने के लिए एक ही आदमी, और हर हफ़्ते फ़ोटो अपडेट।',
    },
    painPoints: {
      en: [
        { title: 'Managing many contractors', text: 'We bring the trades together and manage them, so you do not have to.' },
        { title: 'Delays between one trade and the next', text: 'One schedule for the whole project, so work moves from stage to stage without gaps.' },
        { title: 'Nobody to ask when something goes wrong', text: 'One accountable team and one point of contact from start to handover.' },
      ],
      hi: [
        { title: 'कई ठेकेदारों को सँभालना', text: 'सारे कारीगरों का तालमेल हम करते हैं, आपको नहीं करना पड़ता।' },
        { title: 'एक काम के बाद दूसरे काम में देरी', text: 'पूरे प्रोजेक्ट का एक ही schedule, ताकि काम एक stage से दूसरे stage में बिना रुकावट जाए।' },
        { title: 'कुछ गड़बड़ हो तो पूछें किससे', text: 'शुरू से हैंडओवर तक एक ही ज़िम्मेदार टीम और एक ही संपर्क।' },
      ],
    },
    inclusions: {
      en: ['Planning and scheduling', 'Material and vendor coordination', 'Quality checks at every stage', 'Civil, interior and fabrication under one agreement', 'Weekly photo updates', 'Single point of contact', 'Handover'].map((text) => ({ text })),
      hi: ['प्लानिंग और schedule', 'सामान और कारीगरों का तालमेल', 'हर stage पर क्वालिटी की जाँच', 'सिविल, इंटीरियर और फैब्रिकेशन एक ही agreement में', 'हर हफ़्ते फ़ोटो अपडेट', 'बात करने के लिए एक ही संपर्क', 'हैंडओवर'].map((text) => ({ text })),
    },
    tiers: tiers(
      ['Core project management with essential finishing.', 'Full management with a balanced level of finish.', 'Full management with premium finish and detailing.'],
      ['ज़रूरी finishing के साथ बुनियादी प्रोजेक्ट मैनेजमेंट।', 'संतुलित finishing के साथ पूरा मैनेजमेंट।', 'प्रीमियम finishing और बारीकी के साथ पूरा मैनेजमेंट।'],
    ),
    metaTitle: { en: 'Turnkey Construction & Project Management in Lucknow | SHRIM', hi: 'लखनऊ में टर्नकी निर्माण व प्रोजेक्ट मैनेजमेंट | SHRIM' },
    metaDescription: {
      en: 'Turnkey construction and project management in Lucknow. One agreement, one team, weekly photo updates.',
      hi: 'लखनऊ में टर्नकी निर्माण और प्रोजेक्ट मैनेजमेंट। एक agreement, एक टीम, हर हफ़्ते फ़ोटो अपडेट।',
    },
    faqs: {
      en: [
        { q: 'What does turnkey mean?', a: 'You give us the project and we manage everything until handover – civil work, interiors and fabrication.' },
        { q: 'Can I still make decisions?', a: 'Of course. Key choices like layout, finishes and budget are always yours.' },
        { q: 'How do you keep me updated?', a: 'Weekly photo updates, and you can call or message the same person any time.' },
        { q: 'Is it more expensive than hiring contractors separately?', a: 'It depends on the project. You get one estimate, so you can compare easily.' },
      ],
      hi: [
        { q: 'टर्नकी का मतलब क्या होता है?', a: 'आप प्रोजेक्ट हमें दे देते हैं और हैंडओवर तक सब हम सँभालते हैं – सिविल काम, इंटीरियर और फैब्रिकेशन।' },
        { q: 'क्या फ़ैसले मैं ही लूँगा?', a: 'बिल्कुल। layout, finishing और बजट जैसे बड़े फ़ैसले हमेशा आपके होते हैं।' },
        { q: 'मुझे अपडेट कैसे मिलेगा?', a: 'हर हफ़्ते फ़ोटो अपडेट मिलता है, और आप उसी आदमी को कभी भी कॉल या मैसेज कर सकते हैं।' },
        { q: 'क्या अलग-अलग ठेकेदार लगाने से यह महँगा पड़ता है?', a: 'यह प्रोजेक्ट पर निर्भर करता है। आपको एक ही estimate मिलता है, इसलिए तुलना करना आसान रहता है।' },
      ],
    },
  },
]

export const generalFaqs: L<{ q: string; a: string }>[] = [
  {
    en: { q: 'How much will it cost to build my house?', a: 'It depends on the plot size, floors and finish. Try the cost calculator for a quick range. The exact cost is given after a free site visit.' },
    hi: { q: 'मेरा घर बनवाने में कितना खर्चा आएगा?', a: 'यह प्लॉट के साइज़, मंज़िलों और finishing पर निर्भर करता है। जल्दी अंदाज़े के लिए cost calculator आज़माइए। सही खर्चा फ्री साइट विज़िट के बाद बताया जाता है।' },
  },
  {
    en: { q: 'What is the payment schedule?', a: 'Payments are linked to stages of work and written in the agreement before we start. We explain the stages at the site visit.' },
    hi: { q: 'पेमेंट कैसे करना होता है?', a: 'पेमेंट काम के stage से जुड़ा होता है और शुरू करने से पहले agreement में लिखा जाता है। साइट विज़िट पर हम stages समझा देते हैं।' },
  },
  {
    en: { q: 'Which materials and brands do you use?', a: 'Materials and brands are listed in the estimate for each quality tier, so you know what you are paying for. You can ask us about any brand at the site visit.' },
    hi: { q: 'कौन-सा सामान और कौन-से ब्रांड लगाते हैं?', a: 'हर quality tier के लिए सामान और ब्रांड estimate में लिखे होते हैं, ताकि आपको पता रहे कि पैसा किस चीज़ का है। किसी भी ब्रांड के बारे में साइट विज़िट पर पूछ सकते हैं।' },
  },
  {
    en: { q: 'How long will it take?', a: 'It depends on the size and scope. After the site visit you get a written schedule.' },
    hi: { q: 'कितना समय लगेगा?', a: 'यह साइज़ और काम पर निर्भर करता है। साइट विज़िट के बाद आपको लिखित schedule मिलता है।' },
  },
  {
    en: { q: 'Is there a warranty?', a: 'Warranty and defect-liability terms are discussed and written in the agreement. Please ask us at the site visit.' },
    hi: { q: 'क्या warranty मिलती है?', a: 'Warranty और काम में कमी की ज़िम्मेदारी की शर्तें बात करके agreement में लिखी जाती हैं। साइट विज़िट पर हमसे पूछ लीजिए।' },
  },
  {
    en: { q: 'Can you help with LDA map approval?', a: 'We guide you through the documents and the process. The approval itself is done by LDA and its timing is in their hands. Read our step-by-step guide for details.' },
    hi: { q: 'क्या LDA से नक्शा पास कराने में मदद करते हैं?', a: 'कागज़ात और प्रक्रिया में हम आपको रास्ता बताते हैं। पास करना LDA का काम है और उसका समय उनके हाथ में है। पूरी जानकारी के लिए हमारा step-by-step गाइड पढ़िए।' },
  },
  {
    en: { q: 'Is the site visit really free?', a: 'Yes. There is no charge for the site visit and no obligation to hire us.' },
    hi: { q: 'क्या साइट विज़िट सच में फ्री है?', a: 'जी हाँ। साइट विज़िट का कोई पैसा नहीं लगता और हमें काम देना ज़रूरी नहीं है।' },
  },
  {
    en: { q: 'Do you work in my area?', a: 'Our office is in Chinhat and we work mainly in east Lucknow – Gomti Nagar Extension, Faizabad Road, Matiyari, Kamta, Gomti Nagar and Shaheed Path. We also take projects in other parts of Lucknow. Ask us.' },
    hi: { q: 'क्या आप मेरे इलाक़े में काम करते हैं?', a: 'हमारा ऑफ़िस चिनहट में है और हम ज़्यादातर पूर्वी लखनऊ में काम करते हैं – गोमती नगर एक्सटेंशन, फ़ैज़ाबाद रोड, मटियारी, कामता, गोमती नगर और शहीद पथ। लखनऊ के दूसरे इलाक़ों में भी काम लेते हैं, आप पूछ लीजिए।' },
  },
  {
    en: { q: 'How will I know how the work is going?', a: 'You get photo updates every week, and you are welcome to visit the site any time.' },
    hi: { q: 'काम कैसा चल रहा है, यह कैसे पता चलेगा?', a: 'आपको हर हफ़्ते फ़ोटो अपडेट मिलता है, और आप जब चाहें साइट पर आ सकते हैं।' },
  },
  {
    en: { q: 'Are you a registered business? Will I get a proper bill?', a: 'Yes. SHRIM Enterprises is a GST-registered proprietorship (GSTIN 09BAYPT7371Q2Z3).' },
    hi: { q: 'क्या आपका बिज़नेस रजिस्टर्ड है? क्या पक्का बिल मिलेगा?', a: 'जी हाँ। SHRIM Enterprises एक GST-रजिस्टर्ड प्रोप्राइटरशिप फ़र्म है (GSTIN 09BAYPT7371Q2Z3)।' },
  },
]

const rate = (service: string, b: number, s: number, p: number) =>
  (['basic', 'standard', 'premium'] as const).map((tier, i) => ({ service, tier, rate: [b, s, p][i], note: 'UPDATE BEFORE LAUNCH – sample value' }))

export const rates = {
  sampleData: true,
  rangePercent: 10,
  rates: [
    ...rate('house-construction', 1800, 2100, 2600),
    ...rate('renovation', 900, 1300, 1800),
    ...rate('interior', 1000, 1500, 2200),
    ...rate('turnkey', 2000, 2400, 3000),
  ],
  extras: [
    { key: 'parking', pricing: 'fixed', value: 150000, note: 'UPDATE BEFORE LAUNCH – sample value', label: { en: 'Parking / car porch', hi: 'पार्किंग / कार पोर्च' } },
    { key: 'boundaryWall', pricing: 'fixed', value: 200000, note: 'UPDATE BEFORE LAUNCH – sample value', label: { en: 'Boundary wall', hi: 'बाउंड्री वॉल' } },
    { key: 'basement', pricing: 'perSqft', value: 1200, note: 'UPDATE BEFORE LAUNCH – sample value', label: { en: 'Basement', hi: 'बेसमेंट' } },
  ],
  breakdown: (() => {
    const build = [['Structure', 'स्ट्रक्चर', 45], ['Finishing', 'फ़िनिशिंग', 30], ['Electrical & plumbing', 'इलेक्ट्रिकल व प्लंबिंग', 15], ['Supervision & other', 'सुपरविज़न व अन्य', 10]] as const
    const reno = [['Repair & civil work', 'मरम्मत व सिविल काम', 30], ['Finishing', 'फ़िनिशिंग', 40], ['Electrical & plumbing', 'इलेक्ट्रिकल व प्लंबिंग', 20], ['Other', 'अन्य', 10]] as const
    const intr = [['Woodwork & furniture', 'लकड़ी का काम व फ़र्नीचर', 50], ['Finishing & paint', 'फ़िनिशिंग व पेंट', 20], ['Lighting & electrical', 'लाइटिंग व इलेक्ट्रिकल', 20], ['Other', 'अन्य', 10]] as const
    const rows = (service: string, parts: readonly (readonly [string, string, number])[]) =>
      parts.map(([en, hi, percent]) => ({ service, percent, label: { en, hi } }))
    return [...rows('house-construction', build), ...rows('turnkey', build), ...rows('renovation', reno), ...rows('interior', intr)]
  })(),
}

export const guides: { slug: string; title: L<string>; outline: L<string> }[] = [
  {
    slug: 'lucknow-ghar-banwane-ka-kharcha-2026',
    title: { en: 'Cost of building a house in Lucknow 2026 – per sq ft guide', hi: 'लखनऊ में घर बनवाने का खर्चा 2026 – प्रति sq ft गाइड' },
    outline: {
      en: '- What decides the cost per sq ft\n- Rates by quality tier (fill with real SHRIM rates)\n- Extras: parking, boundary wall, basement\n- Hidden costs people forget (map fees, electricity connection, etc.)\n- How to read an estimate\n- Try the cost calculator / book a site visit',
      hi: '- प्रति sq ft खर्चा किन बातों से तय होता है\n- quality tier के हिसाब से रेट (असली SHRIM रेट यहाँ भरें)\n- अलग से जुड़ने वाले खर्चे: पार्किंग, बाउंड्री वॉल, बेसमेंट\n- वे छुपे खर्चे जो लोग भूल जाते हैं (नक्शा फ़ीस, बिजली कनेक्शन आदि)\n- estimate को कैसे पढ़ें\n- cost calculator आज़माइए / साइट विज़िट बुक करें',
    },
  },
  {
    slug: 'lda-naksha-approval-process',
    title: { en: 'LDA naksha approval – step by step process', hi: 'LDA नक्शा पास कराने की प्रक्रिया – step by step' },
    outline: {
      en: '- Who needs approval and why\n- Documents to keep ready\n- Step-by-step process (verify current rules with LDA before publishing)\n- Common reasons for delay\n- When to start construction\n- How SHRIM can guide you',
      hi: '- किसे नक्शा पास कराना ज़रूरी है और क्यों\n- कौन-से कागज़ात तैयार रखें\n- step-by-step प्रक्रिया (छापने से पहले LDA के मौजूदा नियम जाँच लें)\n- देरी के आम कारण\n- निर्माण कब शुरू करें\n- SHRIM कैसे रास्ता बता सकता है',
    },
  },
  {
    slug: 'ghar-banwane-se-pehle-15-galtiyan',
    title: { en: '15 mistakes people make before building a house', hi: 'घर बनवाने से पहले 15 गलतियाँ जो लोग करते हैं' },
    outline: {
      en: '- Starting without approved map\n- Choosing only on the lowest price\n- No written estimate or agreement\n- Ignoring soil and plot checks\n- Poor planning of electrical/plumbing points\n- … (complete the list of 15 from real site experience)',
      hi: '- पास हुए नक्शे के बिना काम शुरू करना\n- सिर्फ़ सबसे कम दाम देखकर चुनना\n- लिखित estimate या agreement न होना\n- मिट्टी और प्लॉट की जाँच न करवाना\n- बिजली/प्लंबिंग पॉइंट की ठीक प्लानिंग न करना\n- … (असली साइट के अनुभव से 15 की लिस्ट पूरी करें)',
    },
  },
  {
    slug: 'renovation-vs-naya-construction',
    title: { en: 'Renovation vs new construction – which is right when', hi: 'रेनोवेशन या नया निर्माण – कब क्या सही है' },
    outline: {
      en: '- Check the condition of the structure first\n- When renovation makes sense\n- When rebuilding makes sense\n- Cost comparison approach\n- Time and disturbance\n- Book a site visit for an honest opinion',
      hi: '- पहले structure की हालत जाँचिए\n- रेनोवेशन कब ठीक रहता है\n- नया बनवाना कब ठीक रहता है\n- खर्चे की तुलना कैसे करें\n- समय और परेशानी\n- सच्ची राय के लिए साइट विज़िट बुक करें',
    },
  },
]

export const siteSettingsHi = {
  officeHours: 'सोमवार–शनिवार, सुबह 9:30 से शाम 6:30',
  thankYouPromise: 'हम 30 मिनट के अंदर आपको कॉल करेंगे',
}

export const sampleProject = (n: 1 | 2) => ({
  title: n === 1 ? '[SAMPLE – REPLACE] 3 BHK house' : '[SAMPLE – REPLACE] Modular kitchen',
  area: 'Gomti Nagar Extension',
  service: n === 1 ? 'house-construction' : 'interior',
  plotSize: '[SAMPLE – REPLACE]', builtUpArea: '[SAMPLE – REPLACE]', duration: '[SAMPLE – REPLACE]',
  challenge: '[SAMPLE – REPLACE] Describe the customer’s problem.',
  solution: '[SAMPLE – REPLACE] Describe what SHRIM did.',
  result: '[SAMPLE – REPLACE] Describe the outcome.',
})
