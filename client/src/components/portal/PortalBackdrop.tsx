import React from 'react';
import {
  PORTAL_BG_URL,
  WORLD_BG_URL,
  USE_RASTER_PORTAL_OVERRIDES,
  PORTAL_TRANSFORM_ORIGIN,
  WORLD_TRANSFORM_ORIGIN,
} from '../../config/portalAssets';

export interface WorldBackdropProps {
  worldRef?: React.RefObject<HTMLDivElement | null>;
}

export interface PortalGatewayProps {
  portalRef?: React.RefObject<HTMLDivElement | null>;
  opacity?: number;
}

/**
 * WORLD_BG (Fixed Background Layer, zIndex: 0)
 * Full-viewport luminous atmospheric sky & cloud horizon graded strictly in Teacher Ivan's palette:
 * #091326 upper zenith -> #1A3153 deep indigo mid-sky -> #2E527D soft twilight ->
 * #A7C7E7 illuminated cloud banks -> warm #E09B30 golden sunrise glow along the horizon.
 */
export const WorldBackdrop: React.FC<WorldBackdropProps> = ({ worldRef }) => {
  return (
    <div
      id="portal-world-fixed-stage"
      data-testid="portal-world-fixed-stage"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: '#091326',
      }}
    >
      <div
        ref={worldRef}
        id="portal-world-parallax-layer"
        data-testid="portal-world-parallax-layer"
        style={{
          position: 'absolute',
          inset: '-6%',
          width: '112%',
          height: '112%',
          transformOrigin: WORLD_TRANSFORM_ORIGIN,
          willChange: 'transform',
          background:
            'linear-gradient(180deg, #091326 0%, #132642 26%, #1A3153 50%, #2E527D 72%, #A7C7E7 89%, #E09B30 100%)',
        }}
      >
        {USE_RASTER_PORTAL_OVERRIDES && (
          <img
            src={WORLD_BG_URL}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Golden Sunrise Horizon & Soft Denim Atmospheric Mist */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 75% 48% at 52% 42%, rgba(224, 155, 48, 0.34) 0%, rgba(167, 199, 231, 0.24) 44%, rgba(26, 49, 83, 0) 78%)',
          }}
        />

        {/* Upper Zenith Starlight & Subtle Acoustic Aura */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 52% 38%, rgba(250, 250, 250, 0.22) 0%, rgba(167, 199, 231, 0.14) 24%, transparent 56%)',
          }}
        />

        {/* Layered Translucent Cloud Silhouettes & Acoustic Horizon Waves (Pure SVG) */}
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <defs>
            <linearGradient id="ti-cloud-bank-far" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A7C7E7" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#1A3153" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#091326" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="ti-cloud-bank-mid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FAFAFA" stopOpacity="0.32" />
              <stop offset="40%" stopColor="#A7C7E7" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#1A3153" stopOpacity="0.72" />
            </linearGradient>
            <linearGradient id="ti-sunrise-horizon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1A3153" stopOpacity="0.2" />
              <stop offset="35%" stopColor="#A7C7E7" stopOpacity="0.38" />
              <stop offset="52%" stopColor="#E09B30" stopOpacity="0.52" />
              <stop offset="70%" stopColor="#A7C7E7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1A3153" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="ti-portal-sun-core" cx="52%" cy="38%" r="36%">
              <stop offset="0%" stopColor="#FAFAFA" stopOpacity="0.55" />
              <stop offset="32%" stopColor="#E09B30" stopOpacity="0.38" />
              <stop offset="68%" stopColor="#A7C7E7" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#1A3153" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Luminous Core Aligned with Portal Archway Center (52% 38%) */}
          <circle cx="998" cy="410" r="520" fill="url(#ti-portal-sun-core)" />

          {/* Subtle Concentric Acoustic Resonance Rings in the Sky */}
          <circle
            cx="998"
            cy="410"
            r="190"
            fill="none"
            stroke="#FAFAFA"
            strokeOpacity="0.18"
            strokeWidth="1.2"
            strokeDasharray="6 10"
          />
          <circle
            cx="998"
            cy="410"
            r="280"
            fill="none"
            stroke="#E09B30"
            strokeOpacity="0.22"
            strokeWidth="1.2"
          />
          <circle
            cx="998"
            cy="410"
            r="390"
            fill="none"
            stroke="#A7C7E7"
            strokeOpacity="0.16"
            strokeWidth="1"
          />

          {/* Far Illuminated Cloud Bank */}
          <path
            d="M-120,740 C120,660 290,710 490,670 C690,630 820,560 1010,575 C1210,590 1350,670 1560,645 C1730,625 1860,665 2040,715 L2040,1120 L-120,1120 Z"
            fill="url(#ti-cloud-bank-far)"
          />

          {/* Golden Sunrise Horizon Mist Band */}
          <path
            d="M-120,790 C220,700 540,755 980,715 C1360,680 1650,745 2040,770 L2040,980 L-120,980 Z"
            fill="url(#ti-sunrise-horizon)"
          />

          {/* Mid-Ground Soft Denim Cloud Billows */}
          <path
            d="M-120,850 C95,785 260,825 460,795 C670,762 840,705 1035,735 C1230,765 1420,830 1630,795 C1790,768 1920,805 2040,840 L2040,1120 L-120,1120 Z"
            fill="url(#ti-cloud-bank-mid)"
          />

          {/* Deep Studio Horizon Base Vignette so Below-The-Fold Cards Read with AAA Contrast */}
          <path
            d="M-120,930 C340,875 720,915 1060,895 C1420,875 1740,905 2040,935 L2040,1120 L-120,1120 Z"
            fill="#091326"
            fillOpacity="0.72"
          />
        </svg>
      </div>
    </div>
  );
};

/**
 * PORTAL_BG (Foreground Architectural Gateway Layer inside Sticky Intro, zIndex: 5)
 * Full-bleed dark #091326 / #1A3153 architectural studio wall pierced by a centered tall arched
 * acoustic portal (origin centered at 52% 38%) with a 1px #A7C7E7/30 inner bevel,
 * soft #E09B30 Warm Amber rim-light hugging the interior arch edge, and a 100% transparent opening
 * through which the glowing WORLD_BG sky shines.
 */
export const PortalGateway: React.FC<PortalGatewayProps> = ({ portalRef, opacity = 1 }) => {
  return (
    <div
      ref={portalRef}
      id="portal-archway-zoom-layer"
      data-testid="portal-archway-zoom-layer"
      style={{
        position: 'absolute',
        inset: '-6%',
        width: '112%',
        height: '112%',
        transformOrigin: PORTAL_TRANSFORM_ORIGIN,
        willChange: 'transform, opacity',
        opacity,
        pointerEvents: 'none',
      }}
    >
      {USE_RASTER_PORTAL_OVERRIDES ? (
        <img
          src={PORTAL_BG_URL}
          alt=""
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        >
          <defs>
            {/* Architectural Studio Wall Gradient */}
            <radialGradient id="ti-wall-surface" cx="52%" cy="38%" r="72%">
              <stop offset="0%" stopColor="#1A3153" />
              <stop offset="48%" stopColor="#0F1F38" />
              <stop offset="100%" stopColor="#091326" />
            </radialGradient>

            {/* Warm Amber Rim Glow along the Archway Cutout */}
            <linearGradient id="ti-arch-amber-rim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E09B30" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#A7C7E7" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#E09B30" stopOpacity="0.85" />
            </linearGradient>

            {/* Inner Depth Bevel Gradient */}
            <linearGradient id="ti-arch-inner-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#091326" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#1A3153" stopOpacity="0.9" />
            </linearGradient>

            {/* Floor Reflection Gradient */}
            <linearGradient id="ti-floor-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E09B30" stopOpacity="0.22" />
              <stop offset="45%" stopColor="#A7C7E7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#091326" stopOpacity="0.92" />
            </linearGradient>
          </defs>

          {/* Outer Architectural Wall with Transparent Arched Portal Cutout (even-odd fill rule) */}
          {/* Arch Center is at x = 998.4 (52% of 1920), y = 410.4 (38% of 1080) */}
          {/* Arch width = 340px (x: 828 -> 1168, radius = 170), Arch height = 560px (top arc center at y=330, bottom at y=720) */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M -200 -200 H 2120 V 1280 H -200 Z M 828 720 L 828 330 A 170 170 0 0 1 1168 330 L 1168 720 Z"
            fill="url(#ti-wall-surface)"
          />

          {/* Inner Architectural 3D Archway Depth Recess (Surrounding the transparent opening) */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 804 742 L 804 326 A 194 194 0 0 1 1192 326 L 1192 742 Z M 828 720 L 828 330 A 170 170 0 0 1 1168 330 L 1168 720 Z"
            fill="url(#ti-arch-inner-bevel)"
          />

          {/* Subtle Architectural Wall Grid Hairlines (1px #A7C7E7/15) */}
          <line x1="0" y1="720" x2="804" y2="720" stroke="#A7C7E7" strokeOpacity="0.16" strokeWidth="1" />
          <line x1="1192" y1="720" x2="1920" y2="720" stroke="#A7C7E7" strokeOpacity="0.16" strokeWidth="1" />
          <line x1="480" y1="0" x2="480" y2="720" stroke="#A7C7E7" strokeOpacity="0.08" strokeWidth="1" />
          <line x1="1480" y1="0" x2="1480" y2="720" stroke="#A7C7E7" strokeOpacity="0.08" strokeWidth="1" />

          {/* Perspective Studio Floor Spill from the Portal */}
          <polygon
            points="828,720 1168,720 1560,1080 436,1080"
            fill="url(#ti-floor-reflection)"
          />
          <line x1="828" y1="720" x2="436" y2="1080" stroke="#E09B30" strokeOpacity="0.28" strokeWidth="1.2" />
          <line x1="1168" y1="720" x2="1560" y2="1080" stroke="#E09B30" strokeOpacity="0.28" strokeWidth="1.2" />

          {/* Outer 1px Soft Denim Architectural Arch Frame */}
          <path
            d="M 804 742 L 804 326 A 194 194 0 0 1 1192 326 L 1192 742 Z"
            fill="none"
            stroke="#A7C7E7"
            strokeOpacity="0.30"
            strokeWidth="1.5"
          />

          {/* Inner Warm Amber #E09B30 Rim-Light Hugging the Interior Arch Edge */}
          <path
            d="M 828 720 L 828 330 A 170 170 0 0 1 1168 330 L 1168 720 Z"
            fill="none"
            stroke="url(#ti-arch-amber-rim)"
            strokeWidth="2.5"
          />
        </svg>
      )}
    </div>
  );
};
