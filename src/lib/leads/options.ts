/** Values shared by the forms (client) and the server validation. Labels live in the dictionary. */
export const ATTR_COOKIE = 'shrim_attr'
export const ATTR_DAYS = 30
/** Bump when the wording of the consent checkbox changes. Stored with every lead. */
export const CONSENT_VERSION = '2026-10-31-v1'

export const LEAD_SERVICES = ['house-construction', 'interior', 'renovation', 'fabrication', 'turnkey', 'not-sure'] as const
export const PLOT_STATUS = ['ready', 'under-purchase', 'existing-building'] as const
export const BUDGET_BANDS = ['under-10', '10-25', '25-50', '50-100', '100-plus'] as const
export const TIMELINES = ['immediately', '1-3-months', '3-6-months', 'exploring'] as const
export const VISIT_SLOTS = ['morning', 'afternoon', 'evening'] as const
export const FLOORS = ['1', '2', '3', '4-plus'] as const
export const SHORT_SOURCES = ['home', 'service-page', 'contact'] as const

export const CALC_SERVICES = ['new-construction', 'renovation', 'interior'] as const
export const CALC_TIERS = ['basic', 'standard', 'premium'] as const
export const CALC_EXTRAS = ['parking', 'boundaryWall', 'basement'] as const
export const CALC_LIMITS = { minArea: 100, maxArea: 50000, minFloors: 1, maxFloors: 4 }
