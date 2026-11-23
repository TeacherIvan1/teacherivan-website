/**
 * Portal Zoom-In & Luminous Metropolis World Asset Constants
 * -------------------------------------------------------------
 * World backdrop: Animated Global Metropolis ("World of Opportunities")
 * graded strictly in Teacher Ivan's palette (#091326, #1A3153, #2E527D, #A7C7E7, #E09B30).
 * Foreground doorway: Sleek architectural portal zooming 1x -> 7.5x around '52% 38%'.
 */

export const PORTAL_BG_URL = '/assets/portal/doorway-threshold.svg';
export const WORLD_BG_URL = '/assets/portal/metropolis-horizon.svg';

/** When false, PortalBackdrop renders self-contained GPU-accelerated vector/CSS metropolis + doorway layers. */
export const USE_RASTER_PORTAL_OVERRIDES = false;

export const PORTAL_TRANSFORM_ORIGIN = '52% 38%';
export const WORLD_TRANSFORM_ORIGIN = '50% 50%';

export const PARALLAX_MAGNITUDES = {
  world: 6,
  portal: 7,
} as const;
