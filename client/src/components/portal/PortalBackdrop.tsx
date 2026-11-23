import React from 'react';
import {
  PORTAL_BG_URL,
  WORLD_BG_URL,
  USE_RASTER_PORTAL_OVERRIDES,
  PORTAL_TRANSFORM_ORIGIN,
  WORLD_TRANSFORM_ORIGIN,
} from '../../config/portalAssets';
import { DiscoverablePlanetCanvas } from './DiscoverablePlanetCanvas';

export interface WorldBackdropProps {
  worldRef?: React.RefObject<HTMLDivElement | null>;
  scrollProgress?: number;
  isEmbedded?: boolean;
}

export interface PortalGatewayProps {
  portalRef?: React.RefObject<HTMLDivElement | null>;
  opacity?: number;
}

/**
 * WORLD_BG — Discoverable Planet ("Un Nuevo Mundo")
 * -----------------------------------------------------------------------
 * Deep Midnight #091326 cosmic atmosphere transitioning into #1A3153 indigo space,
 * twinkling #FAFAFA/#A7C7E7 star clusters, subtle nebula depth, and a luminous
 * spherical discoverable planet (Three.js WebGL on desktop + crisp SVG/CSS fallback
 * on mobile/reduced-motion) with #E09B30 golden dawn limb glow & orbital rings.
 */
export const WorldBackdrop: React.FC<WorldBackdropProps> = ({
  worldRef,
  scrollProgress = 0,
  isEmbedded = false,
}) => {
  const glowIntensity = Math.min(1, Math.max(0.42, 0.42 + scrollProgress * 0.58));

  return (
    <div
      id={isEmbedded ? 'mobile-planet-stage' : 'portal-world-fixed-stage'}
      data-testid={isEmbedded ? 'mobile-planet-stage' : 'portal-world-fixed-stage'}
      data-world-theme="discoverable-planet"
      style={{
        position: isEmbedded ? 'absolute' : 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: '#091326',
      }}
    >
      <style>{`
        @keyframes tiStarTwinkle {
          0%, 100% { opacity: 0.32; transform: scale(0.92); }
          50% { opacity: 0.96; transform: scale(1.15); }
        }
        @keyframes tiCloudDrift {
          0% { transform: translateX(-18px); }
          50% { transform: translateX(18px); }
          100% { transform: translateX(-18px); }
        }
        @keyframes tiOrbitBeacon {
          0% { stroke-dashoffset: 96; }
          100% { stroke-dashoffset: 0; }
        }
        .ti-star-dot {
          animation: tiStarTwinkle 4.2s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .ti-planet-clouds {
          animation: tiCloudDrift 18s ease-in-out infinite;
        }
        .ti-planet-orbit {
          animation: tiOrbitBeacon 11s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ti-star-dot, .ti-planet-clouds, .ti-planet-orbit {
            animation: none !important;
          }
        }
      `}</style>

      <div
        ref={worldRef}
        id={isEmbedded ? 'mobile-planet-parallax' : 'portal-world-parallax-layer'}
        data-testid={isEmbedded ? 'mobile-planet-parallax' : 'portal-world-parallax-layer'}
        style={{
          position: 'absolute',
          inset: isEmbedded ? 0 : '-6%',
          width: isEmbedded ? '100%' : '112%',
          height: isEmbedded ? '100%' : '112%',
          transformOrigin: WORLD_TRANSFORM_ORIGIN,
          willChange: 'transform',
          background:
            'radial-gradient(ellipse 85% 65% at 54% 58%, #2E527D 0%, #1A3153 38%, #0F1E3A 70%, #091326 100%)',
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

        {/* Golden Dawn of Discovery Limb Radiance */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: glowIntensity,
            transition: 'opacity 0.25s ease-out',
            background:
              'radial-gradient(circle at 60% 44%, rgba(224, 155, 48, 0.34) 0%, rgba(167, 199, 231, 0.18) 32%, rgba(26, 49, 83, 0) 68%)',
          }}
        />

        {/* Cosmic Starfield, Nebula & Crisp SVG/CSS Discoverable Planet Fallback */}
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
            <radialGradient id="ti-planet-body" cx="64%" cy="32%" r="64%">
              <stop offset="0%" stopColor="#A7C7E7" stopOpacity="0.92" />
              <stop offset="18%" stopColor="#2E527D" />
              <stop offset="56%" stopColor="#1A3153" />
              <stop offset="100%" stopColor="#091326" />
            </radialGradient>
            <radialGradient id="ti-planet-dawn-rim" cx="68%" cy="28%" r="54%">
              <stop offset="0%" stopColor="#FAFAFA" stopOpacity="0.88" />
              <stop offset="22%" stopColor="#E09B30" stopOpacity="0.72" />
              <stop offset="52%" stopColor="#A7C7E7" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#091326" stopOpacity="0" />
            </radialGradient>
            <clipPath id="ti-planet-clip">
              <circle cx="998" cy="640" r="340" />
            </clipPath>
          </defs>

          {/* Subtle Indigo-Denim Nebula Depth */}
          <ellipse cx="780" cy="300" rx="560" ry="220" fill="#2E527D" opacity="0.16" />
          <ellipse cx="1280" cy="380" rx="480" ry="210" fill="#1A3153" opacity="0.24" />

          {/* Crisp Twinkling Star Clusters */}
          <g>
            {[
              [210, 140, 2.2, '#FAFAFA', '0s'],
              [340, 240, 1.6, '#A7C7E7', '0.7s'],
              [480, 110, 2.0, '#FAFAFA', '1.4s'],
              [620, 200, 1.5, '#E09B30', '2.1s'],
              [760, 130, 2.3, '#FAFAFA', '0.4s'],
              [890, 175, 1.8, '#A7C7E7', '1.8s'],
              [1060, 120, 2.4, '#FAFAFA', '0.9s'],
              [1190, 195, 1.7, '#E09B30', '2.6s'],
              [1340, 140, 2.1, '#A7C7E7', '1.2s'],
              [1490, 230, 1.6, '#FAFAFA', '0.5s'],
              [1640, 150, 2.3, '#FAFAFA', '1.9s'],
              [1760, 265, 1.7, '#A7C7E7', '2.8s'],
              [280, 390, 1.8, '#A7C7E7', '1.1s'],
              [1620, 410, 2.0, '#E09B30', '0.3s'],
              [440, 310, 1.5, '#FAFAFA', '2.3s'],
              [1420, 310, 1.8, '#FAFAFA', '1.6s'],
            ].map(([cx, cy, r, fill, delay], idx) => (
              <circle
                key={idx}
                className="ti-star-dot"
                cx={cx as number}
                cy={cy as number}
                r={r as number}
                fill={fill as string}
                style={{ animationDelay: delay as string }}
              />
            ))}
          </g>

          {/* Back Orbital Ring Arc */}
          <ellipse
            cx="998"
            cy="640"
            rx="510"
            ry="135"
            transform="rotate(-14 998 640)"
            fill="none"
            stroke="#A7C7E7"
            strokeOpacity="0.28"
            strokeWidth="1.2"
            strokeDasharray="10 10"
            className="ti-planet-orbit"
          />

          {/* Atmospheric Outer Halo Glow */}
          <circle cx="998" cy="640" r="388" fill="url(#ti-planet-dawn-rim)" opacity="0.65" />

          {/* Spherical Discoverable Planet Core (SVG/CSS Baseline & Mobile Fallback) */}
          <circle cx="998" cy="640" r="340" fill="url(#ti-planet-body)" />

          {/* Uncharted Landmasses & Translucent Cloud Bands Clipped to Planet Sphere */}
          <g clipPath="url(#ti-planet-clip)">
            <ellipse cx="890" cy="545" rx="145" ry="62" fill="#2E527D" opacity="0.72" transform="rotate(-12 890 545)" />
            <ellipse cx="1115" cy="590" rx="165" ry="74" fill="#A7C7E7" opacity="0.26" transform="rotate(8 1115 590)" />
            <ellipse cx="965" cy="730" rx="180" ry="66" fill="#244269" opacity="0.78" />
            <g className="ti-planet-clouds">
              <ellipse cx="940" cy="495" rx="170" ry="22" fill="#FAFAFA" opacity="0.28" />
              <ellipse cx="1080" cy="565" rx="190" ry="26" fill="#FAFAFA" opacity="0.22" />
              <ellipse cx="880" cy="640" rx="150" ry="18" fill="#A7C7E7" opacity="0.24" />
            </g>
            {/* Warm Golden Dawn Rim Highlight along Upper-Right Curve */}
            <path
              d="M 850 328 A 340 340 0 0 1 1310 520"
              fill="none"
              stroke="#E09B30"
              strokeWidth="8"
              strokeOpacity="0.82"
            />
          </g>

          {/* Front Tilted Architectural Orbital Ring + Golden Beacon Point */}
          <ellipse
            cx="998"
            cy="640"
            rx="445"
            ry="108"
            transform="rotate(11 998 640)"
            fill="none"
            stroke="#A7C7E7"
            strokeOpacity="0.24"
            strokeWidth="1.2"
          />
          <circle cx="1376" cy="570" r="5" fill="#E09B30" />
          <circle cx="628" cy="548" r="4" fill="#A7C7E7" />
        </svg>

        {/* Desktop WebGL Three.js Procedural Rotating Planet Sphere (Graceful progressive enhancement) */}
        {!isEmbedded && <DiscoverablePlanetCanvas scrollProgress={scrollProgress} />}
      </div>
    </div>
  );
};

/**
 * PORTAL_BG — Dark Architectural Doorway Illuminated by Warm Planet-Rise Light
 * -----------------------------------------------------------------------
 * Preserves the iconic 1x -> 7.5x scroll portal zoom around '52% 38%'.
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
            display: 'block',
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
            <linearGradient id="ti-door-wall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#091326" />
              <stop offset="48%" stopColor="#132642" />
              <stop offset="100%" stopColor="#091326" />
            </linearGradient>
            <linearGradient id="ti-planet-floor-spill" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#E09B30" stopOpacity="0.48" />
              <stop offset="32%" stopColor="#A7C7E7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#091326" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ti-arch-rim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A7C7E7" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#E09B30" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#E09B30" stopOpacity="1" />
            </linearGradient>
            <mask id="ti-doorway-cutout-mask">
              <rect x="0" y="0" width="1920" height="1080" fill="white" />
              <path
                d="M 790 740 L 790 365 A 208 208 0 0 1 1206 365 L 1206 740 Z"
                fill="black"
              />
            </mask>
          </defs>

          <rect
            x="0"
            y="0"
            width="1920"
            height="1080"
            fill="url(#ti-door-wall)"
            mask="url(#ti-doorway-cutout-mask)"
          />

          <g stroke="#A7C7E7" strokeOpacity="0.10" strokeWidth="1" mask="url(#ti-doorway-cutout-mask)">
            <line x1="360" y1="0" x2="360" y2="740" />
            <line x1="1560" y1="0" x2="1560" y2="740" />
            <line x1="0" y1="740" x2="1920" y2="740" />
          </g>

          {/* Warm Planet-Rise Spill Light Across the Threshold */}
          <polygon
            points="790,740 1206,740 1560,1080 436,1080"
            fill="url(#ti-planet-floor-spill)"
            mask="url(#ti-doorway-cutout-mask)"
          />

          {/* Crisp 1px Architectural Frame + Warm Amber Planet-Rise Edge Highlight */}
          <path
            d="M 790 740 L 790 365 A 208 208 0 0 1 1206 365 L 1206 740"
            fill="none"
            stroke="url(#ti-arch-rim)"
            strokeWidth="3.5"
          />
          <path
            d="M 768 740 L 768 365 A 230 230 0 0 1 1228 365 L 1228 740"
            fill="none"
            stroke="#A7C7E7"
            strokeOpacity="0.24"
            strokeWidth="1.2"
          />
          <line x1="790" y1="740" x2="1206" y2="740" stroke="#E09B30" strokeWidth="3" strokeOpacity="0.88" />
        </svg>
      )}
    </div>
  );
};

export default PortalGateway;
