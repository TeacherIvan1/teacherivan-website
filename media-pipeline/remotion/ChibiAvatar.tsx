import React from 'react';

export interface ChibiAvatarProps {
  character?: 'ivan' | 'emma';
  isTalking?: boolean;
  mouthOpen?: boolean;
  isBlinking?: boolean;
  breathY?: number;
  headTilt?: number;
  rightArmAngle?: number;
  leftArmAngle?: number;
}

export const ChibiIvanSvg: React.FC<{
  isTalking: boolean;
  mouthOpen: boolean;
  isBlinking: boolean;
  breathY: number;
  headTilt: number;
  rightArmAngle: number;
  leftArmAngle: number;
}> = ({
  isTalking,
  mouthOpen,
  isBlinking,
  breathY,
  headTilt,
  rightArmAngle,
  leftArmAngle,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600"
      width="100%"
      height="100%"
      role="img"
      aria-labelledby="ivan-title"
    >
      <title id="ivan-title">Chibi Teacher Ivan - Pure Synchronous Rigged SVG</title>
      <defs>
        {/* Vivid Woven Chambray Shirt Texture */}
        <pattern id="chambray-weave" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#8CC2F8" />
          <path
            d="M 0 0 L 8 0 M 0 4 L 8 4 M 0 0 L 0 8 M 4 0 L 4 8"
            stroke="#FAFAFA"
            strokeWidth="1.1"
            strokeOpacity="0.55"
          />
          <path
            d="M 2 0 L 2 8 M 6 0 L 6 8 M 0 2 L 8 2 M 0 6 L 8 6"
            stroke="#285EA8"
            strokeWidth="0.7"
            strokeOpacity="0.18"
          />
        </pattern>

        {/* Subtle Warm Glow Gradient for Background Aura */}
        <radialGradient id="ivan-aura-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FAFAFA" stopOpacity="1" />
          <stop offset="75%" stopColor="#EBF5FF" stopOpacity="1" />
          <stop offset="100%" stopColor="#A7C7E7" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      {/* 1. BACKGROUND AURA & GROUND SHADOW (Static relative to body) */}
      <g id="bg-aura">
        <circle
          cx="300"
          cy="300"
          r="245"
          fill="url(#ivan-aura-grad)"
          stroke="#68A8F0"
          strokeWidth="4"
          strokeOpacity="0.7"
        />
        <circle
          cx="300"
          cy="300"
          r="220"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="3.5"
          strokeDasharray="18 14"
          strokeOpacity="0.85"
        />
        {/* Ground Cast Shadow */}
        <ellipse cx="300" cy="542" rx="96" ry="14" fill="#1A3153" fillOpacity="0.18" />
      </g>

      {/* 2. CHARACTER BODY: Locks torso, head, and arms in 100% lockstep */}
      <g id="character-body" transform={`translate(0, ${breathY})`}>
        {/* TORSO, CHAMBRAY SHIRT, BELT, JEANS & SHOES */}
        <g id="torso">
          {/* Rich Espresso Leather Shoes (#4E3220) */}
          <g id="shoes">
            {/* Left Shoe */}
            <path
              d="M 234 514 C 216 516 206 526 208 535 C 210 541 248 541 260 535 L 264 514 Z"
              fill="#4E3220"
              stroke="#1A3153"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <path
              d="M 214 526 Q 230 520 250 524"
              fill="none"
              stroke="#6E4730"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Right Shoe */}
            <path
              d="M 332 514 L 334 536 C 344 543 376 542 380 534 C 384 524 374 515 358 514 Z"
              fill="#4E3220"
              stroke="#1A3153"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <path
              d="M 344 524 Q 362 520 374 526"
              fill="none"
              stroke="#6E4730"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* Saturated Classic Indigo Denim Jeans (#2B63AC) */}
          <g id="jeans">
            <path
              d="M 238 422 L 362 422 C 366 456 364 490 362 520 L 330 520 L 302 464 L 296 464 L 268 520 L 232 520 C 230 490 234 456 238 422 Z"
              fill="#2B63AC"
              stroke="#1A3153"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            {/* Inner Leg Shading */}
            <path d="M 294 464 L 268 520 L 258 520 L 286 458 Z" fill="#1E4B85" />
            <path d="M 304 464 L 330 520 L 340 520 L 312 458 Z" fill="#1E4B85" />
            {/* Pocket Seams & Fly Details */}
            <path
              d="M 236 446 Q 254 448 258 432"
              fill="none"
              stroke="#1A3153"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 364 446 Q 346 448 342 432"
              fill="none"
              stroke="#1A3153"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line x1="296" y1="434" x2="296" y2="462" stroke="#1A3153" strokeWidth="4" strokeLinecap="round" />
            <line x1="288" y1="458" x2="308" y2="458" stroke="#1A3153" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="306" y1="468" x2="318" y2="468" stroke="#1A3153" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Neck Base (Vivid Warm Peach Skin #FFCC99) */}
          <path d="M 276 310 L 324 310 L 320 348 L 280 348 Z" fill="#FFCC99" stroke="#1A3153" strokeWidth="5" />
          <path d="M 280 314 Q 300 326 320 314" fill="none" stroke="#F0A36A" strokeWidth="4" />

          {/* Vivid Sky-Blue Chambray Button-Up Shirt */}
          <g id="shirt-body">
            <path
              d="M 250 318 C 234 326 232 372 236 420 Q 300 432 364 420 C 368 372 366 326 350 318 Z"
              fill="url(#chambray-weave)"
              stroke="#1A3153"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            {/* Subtle Side Torso Shading */}
            <path
              d="M 240 340 C 236 368 236 396 239 418 L 252 420 C 248 394 248 366 250 340 Z"
              fill="#5B9BD5"
              fillOpacity="0.35"
            />
            <path
              d="M 360 340 C 364 368 364 396 361 418 L 348 420 C 352 394 352 366 350 340 Z"
              fill="#5B9BD5"
              fillOpacity="0.35"
            />

            {/* Open V-Neck Skin Triangle */}
            <polygon
              points="285,316 296,342 315,316"
              fill="#FFCC99"
              stroke="#1A3153"
              strokeWidth="5"
              strokeLinejoin="round"
            />

            {/* Shirt Collar Flaps (#74B3F0) */}
            <polygon
              points="274,315 268,339 291,330 285,316"
              fill="#74B3F0"
              stroke="#1A3153"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <polygon
              points="326,315 332,339 309,330 315,316"
              fill="#74B3F0"
              stroke="#1A3153"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />

            {/* Center Placket & 4 Buttons */}
            <path
              d="M 296 342 Q 293 382 294 422"
              fill="none"
              stroke="#1A3153"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="299" cy="355" r="3" fill="#1A3153" />
            <circle cx="298" cy="374" r="3" fill="#1A3153" />
            <circle cx="298" cy="393" r="3" fill="#1A3153" />
            <circle cx="298" cy="411" r="3" fill="#1A3153" />
          </g>

          {/* Rich Saddle-Brown Leather Belt & Silver Buckle (#7C4722) */}
          <g id="belt">
            <path
              d="M 235 415 Q 300 429 365 415 L 364 427 Q 300 441 236 427 Z"
              fill="#7C4722"
              stroke="#1A3153"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* Belt Loops */}
            <rect x="252" y="417" width="6" height="13" rx="2" fill="#1A3153" />
            <rect x="342" y="417" width="6" height="13" rx="2" fill="#1A3153" />
            {/* Belt Buckle */}
            <rect x="282" y="420" width="24" height="12" rx="3" fill="#FAFAFA" stroke="#1A3153" strokeWidth="4" />
            <rect x="288" y="423" width="12" height="6" rx="1.5" fill="#7C4722" />
          </g>
        </g>

        {/* 3. LEFT ARM & ROLLED CUFF + COMPACT CEFR PROP (Pivots at shoulder: 242, 332) */}
        <g id="left-arm-prop" transform={`rotate(${leftArmAngle}, 242, 332)`}>
          {/* Left Forearm & Hand (Vivid Warm Peach Skin #FFCC99) */}
          <path
            d="M 206 386 C 202 406 202 426 208 438 C 214 447 232 446 234 432 C 236 418 234 402 234 388 Z"
            fill="#FFCC99"
            stroke="#1A3153"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          {/* Inner Arm Shading & Finger Curl */}
          <path
            d="M 228 390 C 230 408 230 424 226 436"
            fill="none"
            stroke="#F59E6C"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 216 423 C 216 434 225 435 225 422"
            fill="none"
            stroke="#1A3153"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Left Short Sleeve & Vivid Rolled Cuff */}
          <path
            d="M 248 320 C 224 328 210 352 206 380 L 238 384 L 242 348 Z"
            fill="url(#chambray-weave)"
            stroke="#1A3153"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="M 201 374 Q 220 371 239 379 L 237 392 Q 219 385 201 388 Z"
            fill="#74B3F0"
            stroke="#1A3153"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Floating / Clip-On Mini CEFR Badge Prop */}
          <g transform="translate(116, 388) rotate(-6)">
            <rect x="0" y="0" width="76" height="54" rx="10" fill="#FAFAFA" stroke="#1A3153" strokeWidth="4" />
            <rect x="6" y="6" width="64" height="18" rx="6" fill="#1A3153" />
            <text
              x="38"
              y="19"
              textAnchor="middle"
              fontFamily="Montserrat, sans-serif"
              fontWeight="800"
              fontSize="9.5"
              fill="#F59E0B"
            >
              CEFR A1-C1
            </text>
            <text
              x="12"
              y="38"
              fontFamily="Montserrat, sans-serif"
              fontWeight="700"
              fontSize="10"
              fill="#1A3153"
            >
              English
            </text>
            <path
              d="M 54 31 L 59 36 L 67 27"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* 4. RIGHT ARM GESTURE (Pivots at shoulder: 358, 332) */}
        <g id="right-arm-gesture" transform={`rotate(${rightArmAngle}, 358, 332)`}>
          {/* Right Forearm & Hand (Vivid Warm Peach Skin #FFCC99) */}
          <path
            d="M 394 386 C 398 406 398 426 392 438 C 386 447 368 446 366 432 C 364 418 366 402 366 388 Z"
            fill="#FFCC99"
            stroke="#1A3153"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="M 372 390 C 370 408 370 424 374 436"
            fill="none"
            stroke="#F59E6C"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Thumb Tucked Detail */}
          <path
            d="M 366 420 C 372 424 374 432 368 436"
            fill="none"
            stroke="#1A3153"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Right Short Sleeve & Rolled Cuff */}
          <path
            d="M 352 320 C 376 328 390 352 394 380 L 362 384 L 358 348 Z"
            fill="url(#chambray-weave)"
            stroke="#1A3153"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="M 361 379 Q 380 371 399 374 L 399 388 Q 381 385 363 392 Z"
            fill="#74B3F0"
            stroke="#1A3153"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </g>

        {/* 5. HEAD GROUP (Pivots at neck: 300, 310) */}
        <g id="head-group" transform={`rotate(${headTilt}, 300, 310)`}>
          {/* Rounded Side Ears (Vivid Warm Peach Skin #FFCC99 + Inner Shading) */}
          <g id="ears">
            <circle cx="188" cy="252" r="24" fill="#FFCC99" stroke="#1A3153" strokeWidth="6" />
            <circle cx="188" cy="252" r="12" fill="#F59E6C" fillOpacity="0.45" />
            <circle cx="412" cy="252" r="24" fill="#FFCC99" stroke="#1A3153" strokeWidth="6" />
            <circle cx="412" cy="252" r="12" fill="#F59E6C" fillOpacity="0.45" />
          </g>

          {/* Wide Rounded-Square Chibi Head (Vivid Warm Peach #FFCC99) */}
          <path
            d="M 192 170 C 188 232 190 278 214 300 C 238 318 268 322 300 322 C 332 322 362 318 386 300 C 410 278 412 232 408 170 C 404 130 360 116 300 116 C 240 116 196 130 192 170 Z"
            fill="#FFCC99"
            stroke="#1A3153"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Subtle Forehead & Chin Warm Shading + Rosy Cheek Glow */}
          <path
            d="M 218 296 Q 300 318 382 296"
            fill="none"
            stroke="#F59E6C"
            strokeWidth="5"
            strokeLinecap="round"
            strokeOpacity="0.55"
          />
          <ellipse cx="220" cy="266" rx="16" ry="9" fill="#F58258" fillOpacity="0.32" />
          <ellipse cx="380" cy="266" rx="16" ry="9" fill="#F58258" fillOpacity="0.32" />

          {/* Rich Warm Espresso-Chestnut Hair (#4E3426 with #634332 Crown Highlight) */}
          <g id="hair">
            <path
              d="M 192 252
                 C 182 234 176 206 174 178
                 C 170 144 182 126 198 120
                 C 194 106 198 92 204 88
                 C 214 96 226 96 238 88
                 C 258 72 288 70 318 76
                 C 356 72 396 84 410 118
                 C 424 136 428 166 420 196
                 C 420 218 416 238 408 252
                 L 404 206
                 C 394 196 390 176 388 152
                 C 348 160 256 160 206 150
                 C 192 164 190 190 192 208
                 Z"
              fill="#4E3426"
              stroke="#1A3153"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            {/* Warm Chestnut Top Crown Sheen */}
            <path d="M 224 104 C 258 84 338 84 384 110 C 362 126 254 128 224 104 Z" fill="#684736" />
            {/* Interior Hair Parting Creases & Sideburn Lines */}
            <path d="M 262 118 Q 270 142 280 156" fill="none" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 348 124 Q 338 144 322 156" fill="none" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 176 192 Q 184 198 191 200" fill="none" stroke="#1A3153" strokeWidth="4" strokeLinecap="round" />
            <path d="M 404 198 Q 412 202 418 198" fill="none" stroke="#1A3153" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Bold Confident Angled Eyebrows */}
          <g id="eyebrows">
            <path
              d="M 212 197 C 232 197 252 204 265 215 C 248 211 228 205 212 202 Z"
              fill="#23160F"
              stroke="#1A3153"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M 388 197 C 368 197 348 204 335 215 C 352 211 372 205 388 202 Z"
              fill="#23160F"
              stroke="#1A3153"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>

          {/* 6A. EYES OPEN LAYER */}
          <g id="eyes-open" opacity={isBlinking ? 0 : 1}>
            <path d="M 218 227 Q 242 214 264 229" fill="none" stroke="#1A3153" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="244" cy="242" rx="14" ry="18" fill="#1A2436" />
            <circle cx="240" cy="235" r="3.5" fill="#FAFAFA" fillOpacity="0.85" />
            <path d="M 336 229 Q 358 214 382 227" fill="none" stroke="#1A3153" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="356" cy="242" rx="14" ry="18" fill="#1A2436" />
            <circle cx="352" cy="235" r="3.5" fill="#FAFAFA" fillOpacity="0.85" />
          </g>

          {/* 6B. EYES BLINK LAYER */}
          <g id="eyes-blink" opacity={isBlinking ? 1 : 0}>
            <path d="M 222 244 Q 244 256 264 244" fill="none" stroke="#1A3153" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 336 244 Q 356 256 378 244" fill="none" stroke="#1A3153" strokeWidth="5.5" strokeLinecap="round" />
          </g>

          {/* Minimalist Curved Chibi Nose Tick */}
          <path d="M 297 256 C 293 263 294 268 300 270" fill="none" stroke="#1A3153" strokeWidth="3.8" strokeLinecap="round" />

          {/* 7A. MOUTH VISEME: SMILE */}
          <g id="mouth-smile" opacity={!isTalking || !mouthOpen ? 1 : 0}>
            <path d="M 275 283 Q 304 288 326 273" fill="none" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 323 268 Q 329 272 328 278" fill="none" stroke="#1A3153" strokeWidth="3.8" strokeLinecap="round" />
          </g>

          {/* 7B. MOUTH VISEME: IDLE */}
          <g id="mouth-idle" opacity={0}>
            <path d="M 284 283 Q 300 287 316 281" fill="none" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
          </g>

          {/* 7C. MOUTH VISEME: TALK OPEN */}
          <g id="mouth-talk-open" opacity={isTalking && mouthOpen ? 1 : 0}>
            <path
              d="M 280 278 Q 300 275 320 278 C 322 294 312 302 300 302 C 288 302 278 294 280 278 Z"
              fill="#1A3153"
              stroke="#1A3153"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <ellipse cx="300" cy="295" rx="10" ry="5" fill="#F06449" />
          </g>

          {/* Sleek Low-Profile Coach Headset Microphone */}
          <g id="headset-mic">
            <rect x="166" y="236" width="14" height="32" rx="7" fill="#1A3153" stroke="#FAFAFA" strokeWidth="2" />
            <circle cx="173" cy="252" r="4" fill="#F59E0B" />
            <path d="M 173 266 C 180 290 212 298 252 292" fill="none" stroke="#4A5568" strokeWidth="4.5" strokeLinecap="round" />
            <rect x="248" y="286" width="14" height="10" rx="5" fill="#F59E0B" stroke="#1A3153" strokeWidth="3" />
          </g>
        </g>
      </g>
    </svg>
  );
};

export const ChibiEmmaSvg: React.FC<{
  isTalking: boolean;
  mouthOpen: boolean;
  isBlinking: boolean;
  breathY: number;
  headTilt: number;
  rightArmAngle: number;
  leftArmAngle: number;
}> = ({
  isTalking,
  mouthOpen,
  isBlinking,
  breathY,
  headTilt,
  rightArmAngle,
  leftArmAngle,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600"
      width="100%"
      height="100%"
      role="img"
      aria-labelledby="emma-title"
    >
      <title id="emma-title">Chibi Coach Emma - Pure Synchronous Rigged SVG</title>
      <defs>
        {/* Vivid Woven Chambray Shirt Texture */}
        <pattern id="chambray-weave-emma" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#8CC2F8" />
          <path
            d="M 0 0 L 8 0 M 0 4 L 8 4 M 0 0 L 0 8 M 4 0 L 4 8"
            stroke="#FAFAFA"
            strokeWidth="1.1"
            strokeOpacity="0.55"
          />
          <path
            d="M 2 0 L 2 8 M 6 0 L 6 8 M 0 2 L 8 2 M 0 6 L 8 6"
            stroke="#285EA8"
            strokeWidth="0.7"
            strokeOpacity="0.18"
          />
        </pattern>

        {/* Subtle Warm Glow Gradient for Emma's Aura */}
        <radialGradient id="emma-aura-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FAFAFA" stopOpacity="1" />
          <stop offset="75%" stopColor="#FFF7EB" stopOpacity="1" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.28" />
        </radialGradient>
      </defs>

      {/* 1. BACKGROUND AURA & GROUND SHADOW */}
      <g id="bg-aura">
        <circle
          cx="300"
          cy="300"
          r="245"
          fill="url(#emma-aura-grad)"
          stroke="#F59E0B"
          strokeWidth="4"
          strokeOpacity="0.65"
        />
        <circle
          cx="300"
          cy="300"
          r="220"
          fill="none"
          stroke="#68A8F0"
          strokeWidth="3.5"
          strokeDasharray="18 14"
          strokeOpacity="0.8"
        />
        {/* Ground Cast Shadow */}
        <ellipse cx="300" cy="542" rx="92" ry="14" fill="#1A3153" fillOpacity="0.18" />
      </g>

      {/* 2. CHARACTER BODY: Locks torso, head, and arms in 100% lockstep */}
      <g id="character-body" transform={`translate(0, ${breathY})`}>
        {/* TORSO, CHAMBRAY BLOUSE, BELT, JEANS & LOAFERS */}
        <g id="torso">
          {/* Rich Espresso Loafers (#4E3220) */}
          <g id="shoes">
            <path
              d="M 238 514 C 220 516 210 526 212 535 C 214 541 250 541 262 535 L 266 514 Z"
              fill="#4E3220"
              stroke="#1A3153"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <path
              d="M 218 526 Q 234 520 252 524"
              fill="none"
              stroke="#6E4730"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 330 514 L 332 536 C 342 543 374 542 378 534 C 382 524 372 515 356 514 Z"
              fill="#4E3220"
              stroke="#1A3153"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <path
              d="M 342 524 Q 360 520 372 526"
              fill="none"
              stroke="#6E4730"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* Saturated Indigo Denim Trousers (#2B63AC) */}
          <g id="jeans">
            <path
              d="M 240 422 L 360 422 C 364 456 362 490 358 520 L 328 520 L 302 464 L 296 464 L 270 520 L 236 520 C 234 490 236 456 240 422 Z"
              fill="#2B63AC"
              stroke="#1A3153"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <path d="M 294 464 L 270 520 L 260 520 L 286 458 Z" fill="#1E4B85" />
            <path d="M 304 464 L 328 520 L 338 520 L 312 458 Z" fill="#1E4B85" />
            <path
              d="M 238 446 Q 256 448 260 432"
              fill="none"
              stroke="#1A3153"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 362 446 Q 344 448 340 432"
              fill="none"
              stroke="#1A3153"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line x1="298" y1="434" x2="298" y2="462" stroke="#1A3153" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Neck Base (Vivid Warm Peach Skin #FFCC99) */}
          <path d="M 278 310 L 322 310 L 318 348 L 282 348 Z" fill="#FFCC99" stroke="#1A3153" strokeWidth="5" />
          <path d="M 282 314 Q 300 326 318 314" fill="none" stroke="#F0A36A" strokeWidth="4" />

          {/* Vivid Sky-Blue Chambray Blouse with Warm Amber Neckerchief */}
          <g id="shirt-body">
            <path
              d="M 252 318 C 236 326 234 372 238 420 Q 300 432 362 420 C 366 372 364 326 348 318 Z"
              fill="url(#chambray-weave-emma)"
              stroke="#1A3153"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <path
              d="M 242 340 C 238 368 238 396 241 418 L 254 420 C 250 394 250 366 252 340 Z"
              fill="#5B9BD5"
              fillOpacity="0.35"
            />
            <path
              d="M 358 340 C 362 368 362 396 359 418 L 346 420 C 350 394 350 366 348 340 Z"
              fill="#5B9BD5"
              fillOpacity="0.35"
            />

            {/* Open V-Neck Skin Triangle */}
            <polygon
              points="285,316 298,342 315,316"
              fill="#FFCC99"
              stroke="#1A3153"
              strokeWidth="5"
              strokeLinejoin="round"
            />

            {/* Vivid Warm Amber Coach Neckerchief Knot (#F59E0B) */}
            <polygon
              points="292,338 306,338 312,358 298,366 286,358"
              fill="#F59E0B"
              stroke="#1A3153"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Crisp Shirt Collar Flaps */}
            <polygon
              points="274,315 268,339 292,331 285,316"
              fill="#FAFAFA"
              stroke="#1A3153"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <polygon
              points="326,315 332,339 308,331 315,316"
              fill="#FAFAFA"
              stroke="#1A3153"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />

            {/* Center Placket & Buttons */}
            <path
              d="M 298 366 Q 296 392 296 422"
              fill="none"
              stroke="#1A3153"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="301" cy="378" r="3" fill="#1A3153" />
            <circle cx="300" cy="396" r="3" fill="#1A3153" />
            <circle cx="300" cy="412" r="3" fill="#1A3153" />
          </g>

          {/* Vivid Warm Amber Belt & Buckle (#E09B30 / #F59E0B) */}
          <g id="belt">
            <path
              d="M 237 415 Q 300 429 363 415 L 362 427 Q 300 441 238 427 Z"
              fill="#E09B30"
              stroke="#1A3153"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <rect x="254" y="417" width="6" height="13" rx="2" fill="#1A3153" />
            <rect x="340" y="417" width="6" height="13" rx="2" fill="#1A3153" />
            <rect x="284" y="420" width="24" height="12" rx="3" fill="#FAFAFA" stroke="#1A3153" strokeWidth="4" />
            <rect x="290" y="423" width="12" height="6" rx="1.5" fill="#1A3153" />
          </g>
        </g>

        {/* 3. LEFT ARM & ROLLED CUFF + COMPACT CEFR PROP (Pivots at shoulder: 242, 332) */}
        <g id="left-arm-prop" transform={`rotate(${leftArmAngle}, 242, 332)`}>
          <path
            d="M 208 386 C 204 406 204 426 210 438 C 216 447 234 446 236 432 C 238 418 236 402 236 388 Z"
            fill="#FFCC99"
            stroke="#1A3153"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="M 230 390 C 232 408 232 424 228 436"
            fill="none"
            stroke="#F59E6C"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 218 423 C 218 434 227 435 227 422"
            fill="none"
            stroke="#1A3153"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Left Short Sleeve & Rolled Cuff */}
          <path
            d="M 250 320 C 226 328 212 352 208 380 L 240 384 L 244 348 Z"
            fill="url(#chambray-weave-emma)"
            stroke="#1A3153"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="M 203 374 Q 222 371 241 379 L 239 392 Q 221 385 203 388 Z"
            fill="#74B3F0"
            stroke="#1A3153"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Mini IELTS / CEFR Recast Card Prop */}
          <g transform="translate(116, 388) rotate(-6)">
            <rect x="0" y="0" width="76" height="54" rx="10" fill="#FAFAFA" stroke="#1A3153" strokeWidth="4" />
            <rect x="6" y="6" width="64" height="18" rx="6" fill="#F59E0B" />
            <text
              x="38"
              y="19"
              textAnchor="middle"
              fontFamily="Montserrat, sans-serif"
              fontWeight="800"
              fontSize="9.5"
              fill="#1A3153"
            >
              IELTS / B2+
            </text>
            <text
              x="12"
              y="38"
              fontFamily="Montserrat, sans-serif"
              fontWeight="700"
              fontSize="10"
              fill="#1A3153"
            >
              Recast
            </text>
            <path
              d="M 54 31 L 59 36 L 67 27"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* 4. RIGHT ARM GESTURE (Pivots at shoulder: 358, 332) */}
        <g id="right-arm-gesture" transform={`rotate(${rightArmAngle}, 358, 332)`}>
          <path
            d="M 392 386 C 396 406 396 426 390 438 C 384 447 366 446 364 432 C 362 418 364 402 364 388 Z"
            fill="#FFCC99"
            stroke="#1A3153"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="M 370 390 C 368 408 368 424 372 436"
            fill="none"
            stroke="#F59E6C"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 364 420 C 370 424 372 432 366 436"
            fill="none"
            stroke="#1A3153"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Right Short Sleeve & Rolled Cuff */}
          <path
            d="M 350 320 C 374 328 388 352 392 380 L 360 384 L 356 348 Z"
            fill="url(#chambray-weave-emma)"
            stroke="#1A3153"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="M 359 379 Q 378 371 397 374 L 397 388 Q 379 385 361 392 Z"
            fill="#74B3F0"
            stroke="#1A3153"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </g>

        {/* 5. HEAD GROUP (Pivots at neck: 300, 310) */}
        <g id="head-group" transform={`rotate(${headTilt}, 300, 310)`}>
          {/* Back Bob Hair Silhouette */}
          <path
            d="M 164 236 C 158 140 208 82 300 82 C 392 82 442 140 436 236 C 434 282 412 314 380 322 L 220 322 C 188 314 166 282 164 236 Z"
            fill="#4E3426"
            stroke="#1A3153"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Rounded Side Ears */}
          <g id="ears">
            <circle cx="188" cy="252" r="22" fill="#FFCC99" stroke="#1A3153" strokeWidth="6" />
            <circle cx="188" cy="252" r="11" fill="#F59E6C" fillOpacity="0.45" />
            <circle cx="412" cy="252" r="22" fill="#FFCC99" stroke="#1A3153" strokeWidth="6" />
            <circle cx="412" cy="252" r="11" fill="#F59E6C" fillOpacity="0.45" />
          </g>

          {/* Wide Rounded-Square Chibi Head */}
          <path
            d="M 192 170 C 188 232 190 278 214 300 C 238 318 268 322 300 322 C 332 322 362 318 386 300 C 410 278 412 232 408 170 C 404 130 360 116 300 116 C 240 116 196 130 192 170 Z"
            fill="#FFCC99"
            stroke="#1A3153"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Chin Shading & Rosy Cheek Glow */}
          <path
            d="M 218 296 Q 300 318 382 296"
            fill="none"
            stroke="#F59E6C"
            strokeWidth="5"
            strokeLinecap="round"
            strokeOpacity="0.55"
          />
          <ellipse cx="218" cy="268" rx="17" ry="9.5" fill="#F58258" fillOpacity="0.38" />
          <ellipse cx="382" cy="268" rx="17" ry="9.5" fill="#F58258" fillOpacity="0.38" />

          {/* Swept Side-Part Bob Hair Crown & Bangs */}
          <g id="hair-front">
            <path
              d="M 184 238
                 C 172 194 174 142 198 112
                 C 226 78 274 72 322 76
                 C 374 76 414 104 424 152
                 C 430 184 424 216 416 238
                 L 406 196
                 C 394 174 374 156 344 146
                 C 314 162 256 164 206 154
                 C 192 172 188 202 184 238 Z"
              fill="#4E3426"
              stroke="#1A3153"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path d="M 222 104 C 258 84 338 84 382 110 C 360 126 254 128 222 104 Z" fill="#684736" />
            <path d="M 334 112 Q 340 132 344 146" fill="none" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 254 124 Q 264 142 274 156" fill="none" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
            <rect
              x="366"
              y="146"
              width="24"
              height="9"
              rx="4.5"
              transform="rotate(16 378 150)"
              fill="#F59E0B"
              stroke="#1A3153"
              strokeWidth="3"
            />
          </g>

          {/* Expressive Arched Eyebrows */}
          <g id="eyebrows">
            <path
              d="M 214 196 C 234 192 254 198 264 208 C 248 204 230 200 214 201 Z"
              fill="#23160F"
              stroke="#1A3153"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M 386 196 C 366 192 346 198 336 208 C 352 204 370 200 386 201 Z"
              fill="#23160F"
              stroke="#1A3153"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>

          {/* 6A. EYES OPEN LAYER (Deep Oval Eyes + Eyelashes) */}
          <g id="eyes-open" opacity={isBlinking ? 0 : 1}>
            <path d="M 218 227 Q 242 214 264 229" fill="none" stroke="#1A3153" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 218 227 L 211 221" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
            <ellipse cx="244" cy="242" rx="14" ry="18" fill="#1A2436" />
            <circle cx="240" cy="235" r="3.5" fill="#FAFAFA" fillOpacity="0.85" />
            <path d="M 336 229 Q 358 214 382 227" fill="none" stroke="#1A3153" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 382 227 L 389 221" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
            <ellipse cx="356" cy="242" rx="14" ry="18" fill="#1A2436" />
            <circle cx="352" cy="235" r="3.5" fill="#FAFAFA" fillOpacity="0.85" />
          </g>

          {/* 6B. EYES BLINK LAYER */}
          <g id="eyes-blink" opacity={isBlinking ? 1 : 0}>
            <path d="M 222 244 Q 244 256 264 244" fill="none" stroke="#1A3153" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 336 244 Q 356 256 378 244" fill="none" stroke="#1A3153" strokeWidth="5.5" strokeLinecap="round" />
          </g>

          {/* Stylish Vivid Amber Glasses */}
          <g id="emma-glasses">
            <rect
              x="208"
              y="212"
              width="70"
              height="52"
              rx="18"
              fill="#FAFAFA"
              fillOpacity="0.14"
              stroke="#F59E0B"
              strokeWidth="4.5"
            />
            <rect
              x="322"
              y="212"
              width="70"
              height="52"
              rx="18"
              fill="#FAFAFA"
              fillOpacity="0.14"
              stroke="#F59E0B"
              strokeWidth="4.5"
            />
            <path d="M 278 234 Q 300 228 322 234" fill="none" stroke="#1A3153" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Minimalist Curved Chibi Nose Tick */}
          <path d="M 297 256 C 293 263 294 268 300 270" fill="none" stroke="#1A3153" strokeWidth="3.8" strokeLinecap="round" />

          {/* 7A. MOUTH VISEME: SMILE */}
          <g id="mouth-smile" opacity={!isTalking || !mouthOpen ? 1 : 0}>
            <path d="M 276 283 Q 304 288 325 274" fill="none" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 322 269 Q 328 273 327 279" fill="none" stroke="#1A3153" strokeWidth="3.8" strokeLinecap="round" />
          </g>

          {/* 7B. MOUTH VISEME: IDLE */}
          <g id="mouth-idle" opacity={0}>
            <path d="M 284 283 Q 300 287 316 281" fill="none" stroke="#1A3153" strokeWidth="4.5" strokeLinecap="round" />
          </g>

          {/* 7C. MOUTH VISEME: TALK OPEN */}
          <g id="mouth-talk-open" opacity={isTalking && mouthOpen ? 1 : 0}>
            <path
              d="M 281 278 Q 300 275 319 278 C 321 294 311 301 300 301 C 289 301 279 294 281 278 Z"
              fill="#1A3153"
              stroke="#1A3153"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <ellipse cx="300" cy="294" rx="9.5" ry="4.5" fill="#F06449" />
          </g>

          {/* Sleek Low-Profile Coach Headset Microphone */}
          <g id="headset-mic">
            <rect x="166" y="236" width="14" height="32" rx="7" fill="#1A3153" stroke="#FAFAFA" strokeWidth="2" />
            <circle cx="173" cy="252" r="4" fill="#74B3F0" />
            <path d="M 173 266 C 180 290 212 298 252 292" fill="none" stroke="#4A5568" strokeWidth="4.5" strokeLinecap="round" />
            <rect x="248" y="286" width="14" height="10" rx="5" fill="#F59E0B" stroke="#1A3153" strokeWidth="3" />
          </g>
        </g>
      </g>
    </svg>
  );
};

export const ChibiAvatar: React.FC<ChibiAvatarProps> = ({
  character = 'ivan',
  isTalking = false,
  mouthOpen = false,
  isBlinking = false,
  breathY = 0,
  headTilt = 0,
  rightArmAngle = 0,
  leftArmAngle = 0,
}) => {
  if (character === 'emma') {
    return (
      <ChibiEmmaSvg
        isTalking={isTalking}
        mouthOpen={mouthOpen}
        isBlinking={isBlinking}
        breathY={breathY}
        headTilt={headTilt}
        rightArmAngle={rightArmAngle}
        leftArmAngle={leftArmAngle}
      />
    );
  }
  return (
    <ChibiIvanSvg
      isTalking={isTalking}
      mouthOpen={mouthOpen}
      isBlinking={isBlinking}
      breathY={breathY}
      headTilt={headTilt}
      rightArmAngle={rightArmAngle}
      leftArmAngle={leftArmAngle}
    />
  );
};
