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
  scrollProgress?: number;
  isEmbedded?: boolean;
}

export interface PortalGatewayProps {
  portalRef?: React.RefObject<HTMLDivElement | null>;
  opacity?: number;
}

/**
 * WORLD_BG — Luminous International Metropolis ("World of Opportunities")
 * -----------------------------------------------------------------------
 * Replaces any desert/cloud backdrop with a 3-layer parallax global cityscape:
 *  - Zenith #091326 -> #1A3153 -> #2E527D -> #A7C7E7 mist -> #E09B30 sunrise core
 *  - Far Skyline (skyscrapers + suspension bridge spans)
 *  - Mid Skyline (modern glass towers + twinkling #E09B30 / #FAFAFA penthouse windows)
 *  - Near Horizon Avenue (golden bokeh boulevard glow)
 *  - GPU-accelerated sun-rays, ascending opportunity light streams & global connection arcs
 */
export const WorldBackdrop: React.FC<WorldBackdropProps> = ({
  worldRef,
  scrollProgress = 0,
  isEmbedded = false,
}) => {
  const beamIntensity = Math.min(1, Math.max(0.35, 0.35 + scrollProgress * 0.65));

  return (
    <div
      id={isEmbedded ? 'mobile-metropolis-stage' : 'portal-world-fixed-stage'}
      data-testid={isEmbedded ? 'mobile-metropolis-stage' : 'portal-world-fixed-stage'}
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
        @keyframes tiMetropolisFloat {
          0% { transform: translateY(18px); opacity: 0; }
          25% { opacity: 0.85; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-96px); opacity: 0; }
        }
        @keyframes tiWindowTwinkle {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.95; }
        }
        @keyframes tiArcFlow {
          0% { stroke-dashoffset: 64; }
          100% { stroke-dashoffset: 0; }
        }
        .ti-opportunity-stream {
          animation: tiMetropolisFloat 6.5s linear infinite;
          will-change: transform, opacity;
        }
        .ti-window-twinkle {
          animation: tiWindowTwinkle 3.8s ease-in-out infinite;
        }
        .ti-global-arc {
          animation: tiArcFlow 7s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ti-opportunity-stream,
          .ti-window-twinkle,
          .ti-global-arc {
            animation: none !important;
          }
        }
      `}</style>

      <div
        ref={worldRef}
        id={isEmbedded ? 'mobile-metropolis-parallax' : 'portal-world-parallax-layer'}
        data-testid={isEmbedded ? 'mobile-metropolis-parallax' : 'portal-world-parallax-layer'}
        style={{
          position: 'absolute',
          inset: isEmbedded ? 0 : '-6%',
          width: isEmbedded ? '100%' : '112%',
          height: isEmbedded ? '100%' : '112%',
          transformOrigin: WORLD_TRANSFORM_ORIGIN,
          willChange: 'transform',
          background:
            'linear-gradient(180deg, #091326 0%, #132642 26%, #1A3153 50%, #2E527D 74%, #A7C7E7 91%, #E09B30 100%)',
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

        {/* Golden-Hour Opportunity Sun-Rays Expanding Behind Downtown Core */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: beamIntensity,
            transition: 'opacity 0.25s ease-out',
            background:
              'radial-gradient(ellipse 68% 46% at 52% 44%, rgba(224, 155, 48, 0.50) 0%, rgba(167, 199, 231, 0.24) 42%, rgba(26, 49, 83, 0) 76%)',
          }}
        />

        {/* Luminous International Metropolis SVG (3-Layer Skyline + Global Connection Arcs + Ascending Streams) */}
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
            <radialGradient id="ti-city-sunrise" cx="52%" cy="46%" r="36%">
              <stop offset="0%" stopColor="#FAFAFA" stopOpacity="0.62" />
              <stop offset="30%" stopColor="#E09B30" stopOpacity="0.46" />
              <stop offset="68%" stopColor="#A7C7E7" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#091326" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ti-tower-far" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#264572" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#0D1C35" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="ti-tower-mid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1A3153" stopOpacity="0.94" />
              <stop offset="100%" stopColor="#091326" stopOpacity="0.98" />
            </linearGradient>
            <linearGradient id="ti-avenue-glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E09B30" stopOpacity="0.48" />
              <stop offset="45%" stopColor="#1A3153" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#091326" stopOpacity="0.98" />
            </linearGradient>
            <linearGradient id="ti-beam-grad" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#E09B30" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#FAFAFA" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sunrise Core & Subtle Opportunity Sun-Beams */}
          <circle cx="998" cy="490" r="420" fill="url(#ti-city-sunrise)" />
          <g opacity="0.22">
            <polygon points="998,520 620,0 760,0" fill="url(#ti-beam-grad)" />
            <polygon points="998,520 930,0 1070,0" fill="url(#ti-beam-grad)" />
            <polygon points="998,520 1240,0 1380,0" fill="url(#ti-beam-grad)" />
          </g>

          {/* Global Connection Orbital Arcs (International Flight Paths / Remote Work Connectivity) */}
          <g fill="none" stroke="#A7C7E7" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="8 8">
            <path className="ti-global-arc" d="M220 420 Q680 120 1180 350" />
            <path className="ti-global-arc" d="M740 370 Q1240 110 1720 410" style={{ animationDelay: '2.2s' }} />
            <path className="ti-global-arc" d="M440 460 Q998 190 1560 440" stroke="#E09B30" strokeOpacity="0.38" style={{ animationDelay: '1.1s' }} />
          </g>
          {/* Connection Node Dots */}
          <circle cx="680" cy="240" r="3" fill="#E09B30" opacity="0.85" />
          <circle cx="1180" cy="350" r="3" fill="#A7C7E7" opacity="0.85" />
          <circle cx="1240" cy="235" r="3" fill="#E09B30" opacity="0.85" />

          {/* LAYER 1: FAR SKYLINE & SUSPENSION BRIDGE SPANS */}
          <g fill="url(#ti-tower-far)">
            {/* Distant Suspension Bridge Left */}
            <path d="M40 690 Q240 590 440 690" fill="none" stroke="#A7C7E7" strokeWidth="1.5" strokeOpacity="0.35" />
            <rect x="234" y="540" width="12" height="170" />
            <rect x="434" y="560" width="10" height="150" />
            {/* Far Skyscrapers */}
            <rect x="480" y="470" width="64" height="260" rx="2" />
            <rect x="560" y="420" width="76" height="310" rx="2" />
            <rect x="652" y="380" width="58" height="350" rx="2" />
            <polygon points="732,330 762,278 792,330 792,730 732,730" />
            <rect x="810" y="365" width="72" height="365" rx="2" />
            <rect x="900" y="320" width="84" height="410" rx="2" />
            <polygon points="996,260 1016,214 1036,260 1054,260 1054,730 996,730" />
            <rect x="1072" y="340" width="78" height="390" rx="2" />
            <rect x="1166" y="388" width="66" height="342" rx="2" />
            <rect x="1248" y="432" width="82" height="298" rx="2" />
            <rect x="1348" y="475" width="70" height="255" rx="2" />
            {/* Distant Suspension Bridge Right */}
            <path d="M1440 690 Q1640 590 1840 690" fill="none" stroke="#A7C7E7" strokeWidth="1.5" strokeOpacity="0.35" />
            <rect x="1634" y="545" width="12" height="165" />
          </g>

          {/* LAYER 2: MID SKYLINE MODERN GLASS TOWERS WITH ARCHITECTURAL EDGE LINES */}
          <g fill="url(#ti-tower-mid)" stroke="#A7C7E7" strokeOpacity="0.22" strokeWidth="1">
            <rect x="90" y="530" width="96" height="310" />
            <rect x="210" y="460" width="108" height="380" />
            <rect x="345" y="510" width="88" height="330" />
            <rect x="520" y="455" width="92" height="385" />
            <rect x="635" y="410" width="102" height="430" />
            <rect x="760" y="380" width="98" height="460" />
            <rect x="885" y="355" width="110" height="485" />
            <rect x="1020" y="345" width="106" height="495" />
            <rect x="1150" y="405" width="96" height="435" />
            <rect x="1270" y="450" width="104" height="390" />
            <rect x="1410" y="500" width="98" height="340" />
            <rect x="1540" y="465" width="112" height="375" />
            <rect x="1685" y="520" width="120" height="320" />
          </g>

          {/* Animated Twinkling Office & Penthouse Window Clusters */}
          <g>
            <rect className="ti-window-twinkle" x="656" y="440" width="18" height="4" fill="#E09B30" />
            <rect className="ti-window-twinkle" x="688" y="468" width="24" height="4" fill="#FAFAFA" style={{ animationDelay: '0.8s' }} />
            <rect className="ti-window-twinkle" x="782" y="416" width="22" height="4" fill="#E09B30" style={{ animationDelay: '1.4s' }} />
            <rect className="ti-window-twinkle" x="814" y="446" width="18" height="4" fill="#A7C7E7" style={{ animationDelay: '0.4s' }} />
            <rect className="ti-window-twinkle" x="908" y="390" width="26" height="4" fill="#E09B30" style={{ animationDelay: '1.9s' }} />
            <rect className="ti-window-twinkle" x="944" y="424" width="22" height="4" fill="#FAFAFA" style={{ animationDelay: '0.6s' }} />
            <rect className="ti-window-twinkle" x="1042" y="382" width="24" height="4" fill="#E09B30" style={{ animationDelay: '1.2s' }} />
            <rect className="ti-window-twinkle" x="1076" y="418" width="20" height="4" fill="#FAFAFA" style={{ animationDelay: '2.3s' }} />
            <rect className="ti-window-twinkle" x="1172" y="442" width="20" height="4" fill="#E09B30" style={{ animationDelay: '0.9s' }} />
            <rect className="ti-window-twinkle" x="1296" y="486" width="24" height="4" fill="#A7C7E7" style={{ animationDelay: '1.6s' }} />
          </g>

          {/* Ascending Opportunity Light Streams & Glowing Vertical Energy Filaments */}
          <g>
            <rect className="ti-opportunity-stream" x="752" y="480" width="2.2" height="48" rx="1" fill="#E09B30" />
            <rect className="ti-opportunity-stream" x="876" y="440" width="2.5" height="62" rx="1" fill="#FAFAFA" style={{ animationDelay: '1.5s' }} />
            <rect className="ti-opportunity-stream" x="1008" y="420" width="2.8" height="68" rx="1" fill="#E09B30" style={{ animationDelay: '0.7s' }} />
            <rect className="ti-opportunity-stream" x="1138" y="460" width="2.2" height="54" rx="1" fill="#A7C7E7" style={{ animationDelay: '2.4s' }} />
            <rect className="ti-opportunity-stream" x="1258" y="500" width="2.2" height="44" rx="1" fill="#E09B30" style={{ animationDelay: '3.2s' }} />
          </g>

          {/* LAYER 3: NEAR HORIZON GOLDEN BOULEVARD & BOKEH GLOW */}
          <rect x="0" y="720" width="1920" height="360" fill="url(#ti-avenue-glow)" />
          <ellipse cx="998" cy="726" rx="580" ry="22" fill="#E09B30" opacity="0.34" />
          {/* Subtle Boulevard Perspective Lines */}
          <line x1="998" y1="720" x2="480" y2="1080" stroke="#E09B30" strokeOpacity="0.28" strokeWidth="1.5" />
          <line x1="998" y1="720" x2="1520" y2="1080" stroke="#E09B30" strokeOpacity="0.28" strokeWidth="1.5" />
          <line x1="998" y1="720" x2="998" y2="1080" stroke="#FAFAFA" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="10 14" />
        </svg>
      </div>
    </div>
  );
};

/**
 * PORTAL_BG — Sleek Architectural Doorway Framing the Metropolis
 * -----------------------------------------------------------------------
 * Dark architectural #091326 / #1A3153 threshold with crisp 1px #A7C7E7/35 inner frame
 * and warm #E09B30 golden city spill-light hugging the doorway edges.
 * Zooms cleanly 1x -> 7.5x around '52% 38%'.
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
            <linearGradient id="ti-door-floor-spill" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#E09B30" stopOpacity="0.46" />
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

          {/* Dark Architectural Studio Wall with Arched Doorway Opening */}
          <rect
            x="0"
            y="0"
            width="1920"
            height="1080"
            fill="url(#ti-door-wall)"
            mask="url(#ti-doorway-cutout-mask)"
          />

          {/* Subtle Architectural Paneling Lines */}
          <g stroke="#A7C7E7" strokeOpacity="0.10" strokeWidth="1" mask="url(#ti-doorway-cutout-mask)">
            <line x1="360" y1="0" x2="360" y2="740" />
            <line x1="1560" y1="0" x2="1560" y2="740" />
            <line x1="0" y1="740" x2="1920" y2="740" />
          </g>

          {/* Floor Threshold & Warm Golden City Spill-Light */}
          <polygon
            points="790,740 1206,740 1560,1080 436,1080"
            fill="url(#ti-door-floor-spill)"
            mask="url(#ti-doorway-cutout-mask)"
          />

          {/* Crisp 1px Inner Architectural Frame + Golden Edge Highlight */}
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
            strokeOpacity="0.22"
            strokeWidth="1.2"
          />
          <line x1="790" y1="740" x2="1206" y2="740" stroke="#E09B30" strokeWidth="3" strokeOpacity="0.85" />
        </svg>
      )}
    </div>
  );
};

export default PortalGateway;
