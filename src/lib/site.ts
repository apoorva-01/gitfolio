// Public site URL shown in profile/share links and marketing copy.
// Override per-environment with NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gitfolio.blossomn.com').replace(/\/$/, '')
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '')
