/**
 * Brand-Native Portal & World Visual Assets Configuration
 * Path: client/src/config/portalAssets.ts
 * -------------------------------------------------------------
 * Zero third-party hotlinks. Provides optional local override paths
 * backed by the self-contained SVG/CSS atmospheric layers in PortalBackdrop.tsx.
 */

export const PORTAL_BG_URL = '/assets/portal/portal-bg.webp';
export const WORLD_BG_URL = '/assets/portal/world-bg.webp';

/**
 * Set to true only if external raster .webp overrides are placed in /public/assets/portal/.
 * Defaults to false so the razor-sharp, zero-network-failure brand-native SVG/CSS
 * atmospheric sky (`WORLD_BG`) and arched acoustic portal (`PORTAL_BG`) render immediately.
 */
export const USE_RASTER_PORTAL_OVERRIDES = false;

export const PORTAL_TRANSFORM_ORIGIN = '52% 38%';
export const WORLD_TRANSFORM_ORIGIN = '50% 50%';

export const PARALLAX_MAGNITUDES = {
  world: 6,
  portal: 7,
} as const;
