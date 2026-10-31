import type { Locale } from './config'

const en = {
  bookVisit: 'Book a Free Site Visit',
  bookVisitShort: 'Site Visit',
  call: 'Call',
  whatsapp: 'WhatsApp',
  calculateCost: 'Calculate Cost',
  tagline: 'Construction • Interiors • Fabrication',
  nav: { home: 'Home', services: 'Services', projects: 'Projects', commercial: 'Commercial', calculator: 'Cost Calculator', guides: 'Guides', about: 'About', contact: 'Contact' },
  footer: { services: 'Services', company: 'Company', areas: 'Areas we serve', legal: 'Legal', privacy: 'Privacy Policy', terms: 'Terms of Use', contact: 'Contact' },
  svc: { 'house-construction': 'House Construction', interior: 'Interior Works', renovation: 'Renovation', fabrication: 'Fabrication', turnkey: 'Turnkey & Project Management' },
  promise: 'Naksha se chaabi tak, ek hi team.',
  switchTo: 'हिंदी',
}

const hi: typeof en = {
  bookVisit: 'फ्री साइट विज़िट बुक करें',
  bookVisitShort: 'साइट विज़िट',
  call: 'कॉल',
  whatsapp: 'व्हाट्सऐप',
  calculateCost: 'खर्चा निकालें',
  tagline: 'Construction • Interiors • Fabrication',
  nav: { home: 'होम', services: 'सेवाएँ', projects: 'प्रोजेक्ट्स', commercial: 'कमर्शियल', calculator: 'कॉस्ट कैलकुलेटर', guides: 'गाइड', about: 'हमारे बारे में', contact: 'संपर्क' },
  footer: { services: 'सेवाएँ', company: 'कंपनी', areas: 'हमारे सेवा क्षेत्र', legal: 'कानूनी', privacy: 'प्राइवेसी पॉलिसी', terms: 'उपयोग की शर्तें', contact: 'संपर्क' },
  svc: { 'house-construction': 'घर निर्माण', interior: 'इंटीरियर', renovation: 'रेनोवेशन', fabrication: 'फैब्रिकेशन', turnkey: 'टर्नकी व प्रोजेक्ट मैनेजमेंट' },
  promise: 'नक्शे से चाबी तक, एक ही टीम।',
  switchTo: 'English',
}

export const getDictionary = (locale: Locale) => (locale === 'hi' ? hi : en)
export type Dictionary = typeof en
export const serviceSlugs = ['house-construction', 'interior', 'renovation', 'fabrication', 'turnkey'] as const
export const priorityAreas = ['Gomti Nagar Extension', 'Chinhat', 'Faizabad Road', 'Matiyari', 'Kamta', 'Gomti Nagar', 'Shaheed Path']
export const secondaryAreas = ['Indira Nagar', 'Sushant Golf City', 'Sultanpur Road', 'Vrindavan Yojana']
