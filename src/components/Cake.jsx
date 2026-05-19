import { motion, AnimatePresence } from 'framer-motion';
import './Cake.css';

/**
 * Cake SVG component.
 * `layers` = number of completed levels (0–6). The cake grows from the bottom up.
 * `lit` = whether candles are flickering (used at the end).
 * `compact` = smaller display mode for tight spaces.
 */

const LAYER_DEFS = [
  // 0 — base plate (always shown)
  { name: 'plate' },
  // 1 — pencil sketch frosting (level 1)
  { name: 'sketch', label: 'sketch' },
  // 2 — paint splash (level 2)
  { name: 'paint', label: 'paint' },
  // 3 — biryani decorations (level 3)
  { name: 'biryani', label: 'spices' },
  // 4 — bharatanatyam patterns (level 4)
  { name: 'dance', label: 'mehendi' },
  // 5 — music notes (level 5)
  { name: 'music', label: 'notes' },
  // 6 — final japanese-inspired top (level 6)
  { name: 'sakura', label: 'sakura' }
];

export default function Cake({ layers = 0, lit = false, compact = false }) {
  const size = compact ? 240 : 340;
  // base coords
  const cx = 200;
  // each layer height shrinks slightly; bottom layer is widest
  const layerData = [
    { y: 360, w: 320, h: 60, color: 'var(--pink)', frostColor: 'var(--pink-soft)' },     // L1 bottom
    { y: 302, w: 280, h: 58, color: 'var(--yellow)', frostColor: 'var(--yellow-soft)' },  // L2
    { y: 246, w: 240, h: 56, color: 'var(--cream-dark)', frostColor: 'var(--cream)' },    // L3
    { y: 192, w: 200, h: 54, color: 'var(--lavender)', frostColor: 'var(--lavender-soft)' }, // L4
    { y: 140, w: 160, h: 52, color: 'var(--blue)', frostColor: 'var(--blue-soft)' },     // L5
    { y: 90,  w: 120, h: 50, color: 'var(--pink-soft)', frostColor: '#FFFFFF' }           // L6 top
  ];

  return (
    <div className={`cake-wrap ${compact ? 'cake-wrap--compact' : ''}`}>
      <svg
        viewBox="0 0 400 440"
        width={size}
        height={size * (440 / 400)}
        className="cake-svg"
        aria-label={`Cake with ${layers} of 6 layers`}
      >
        {/* SOFT GLOW behind cake when lit */}
        <defs>
          <radialGradient id="glow" cx="0.5" cy="0.6" r="0.6">
            <stop offset="0%" stopColor="#FFD56B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFD56B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF" />
            <stop offset="100%" stopColor="#E5D7FF" />
          </linearGradient>
          {/* drip shape clipPath */}
          <clipPath id="dripClip">
            <rect x="0" y="0" width="400" height="440" />
          </clipPath>
          <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        {lit && (
          <motion.ellipse
            cx="200"
            cy="240"
            rx="200"
            ry="160"
            fill="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* PLATE — always */}
        <motion.g
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ellipse cx={cx} cy={418} rx={170} ry={14} fill="rgba(106,76,147,0.15)" />
          <ellipse cx={cx} cy={414} rx={160} ry={12} fill="url(#plateGrad)" />
          <ellipse cx={cx} cy={410} rx={150} ry={9} fill="#FFFFFF" opacity="0.7" />
        </motion.g>

        {/* LAYERS — grow from bottom up */}
        <AnimatePresence>
          {layerData.map((L, i) => {
            if (i >= layers) return null;
            const layerKey = LAYER_DEFS[i + 1]?.name || `layer-${i}`;
            return (
              <motion.g
                key={layerKey}
                initial={{ y: -40, opacity: 0, scale: 0.7 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.85,
                  delay: 0.1,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                style={{ transformOrigin: `${cx}px ${L.y + L.h}px` }}
              >
                <CakeLayer
                  cx={cx}
                  y={L.y}
                  w={L.w}
                  h={L.h}
                  color={L.color}
                  frostColor={L.frostColor}
                  themeIndex={i}
                />
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* CANDLE on the top layer once all 6 layers placed */}
        {layers >= 6 && (
          <motion.g
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <rect x={cx - 5} y={50} width={10} height={40} rx={2} fill="var(--pink)" />
            <rect x={cx - 5} y={50} width={10} height={40} rx={2} fill="url(#stripe)" opacity="0.4" />
            {lit && (
              <motion.g
                animate={{ scale: [1, 1.15, 1], rotate: [-2, 2, -2] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: `${cx}px 40px` }}
              >
                <ellipse cx={cx} cy={36} rx={6} ry={12} fill="#FFD56B" />
                <ellipse cx={cx} cy={32} rx={3} ry={7} fill="#FFF6EC" />
              </motion.g>
            )}
            {!lit && <ellipse cx={cx} cy={48} rx={1.5} ry={2} fill="#3A2E4A" />}
          </motion.g>
        )}

        {/* SPARKLES around lit cake */}
        {lit && <Sparkles />}
      </svg>
    </div>
  );
}

/**
 * Each cake layer is its own component so its theming can be unique.
 */
function CakeLayer({ cx, y, w, h, color, frostColor, themeIndex }) {
  const x = cx - w / 2;
  return (
    <g>
      {/* Drop shadow */}
      <ellipse cx={cx} cy={y + h + 4} rx={w / 2 - 4} ry={6} fill="rgba(106,76,147,0.12)" />

      {/* Main layer body */}
      <rect x={x} y={y} width={w} height={h} rx={12} fill={color} />
      {/* highlight */}
      <rect x={x} y={y} width={w} height={h * 0.35} rx={12} fill="white" opacity="0.18" />
      {/* bottom shading */}
      <rect x={x} y={y + h * 0.7} width={w} height={h * 0.3} fill="rgba(0,0,0,0.07)" />

      {/* Frosting drips along the top */}
      <FrostingTop cx={cx} y={y} w={w} frostColor={frostColor} />

      {/* Theme decoration per layer */}
      <LayerDecoration themeIndex={themeIndex} cx={cx} y={y} w={w} h={h} />
    </g>
  );
}

function FrostingTop({ cx, y, w, frostColor }) {
  // Build a drippy frosting strip with curved drops
  const left = cx - w / 2;
  const right = cx + w / 2;
  const drops = 7;
  const stepX = w / drops;
  let d = `M ${left} ${y} `;
  d += `L ${left} ${y - 6} `;
  for (let i = 0; i <= drops; i++) {
    const px = left + i * stepX;
    const dropH = 8 + (i % 2 === 0 ? 6 : 14);
    if (i === 0) {
      d += `Q ${px + stepX / 4} ${y - 10}, ${px + stepX / 2} ${y + dropH - 6} `;
    } else if (i === drops) {
      d += `Q ${px - stepX / 4} ${y - 10}, ${px} ${y - 6} `;
    } else {
      d += `Q ${px} ${y - 12}, ${px + stepX / 4} ${y + dropH * 0.4} `;
      d += `Q ${px + stepX / 2} ${y + dropH}, ${px + (stepX * 3) / 4} ${y + dropH * 0.4} `;
    }
  }
  d += `L ${right} ${y} Z`;
  return (
    <g>
      <path d={d} fill={frostColor} />
      <path d={d} fill="white" opacity="0.35" transform={`translate(0, -2)`} />
    </g>
  );
}

/**
 * Each layer gets a different decoration matching its theme.
 */
function LayerDecoration({ themeIndex, cx, y, w, h }) {
  switch (themeIndex) {
    case 0: // L1 SKETCH — pencil scribbles
      return (
        <g opacity="0.8">
          <path
            d={`M ${cx - 80} ${y + 30} q 20 -10, 40 0 t 40 0 t 40 0`}
            stroke="var(--plum)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
          <circle cx={cx - 60} cy={y + 45} r="3" fill="none" stroke="var(--plum)" strokeWidth="1.2" />
          <circle cx={cx + 40} cy={y + 45} r="3" fill="none" stroke="var(--plum)" strokeWidth="1.2" />
        </g>
      );
    case 1: // L2 PAINT — splashes
      return (
        <g>
          <circle cx={cx - 80} cy={y + 30} r="6" fill="var(--pink)" opacity="0.85" />
          <circle cx={cx - 50} cy={y + 38} r="4" fill="var(--lavender)" />
          <circle cx={cx - 20} cy={y + 28} r="5" fill="var(--blue)" />
          <circle cx={cx + 15} cy={y + 36} r="6" fill="var(--yellow)" opacity="0.9" />
          <circle cx={cx + 50} cy={y + 30} r="4" fill="var(--pink-deep)" />
          <circle cx={cx + 80} cy={y + 38} r="5" fill="var(--lavender)" />
        </g>
      );
    case 2: // L3 BIRYANI — rice grains and chili
      return (
        <g>
          {[-70, -45, -20, 5, 30, 55].map((dx, i) => (
            <ellipse
              key={i}
              cx={cx + dx}
              cy={y + 30 + (i % 2 === 0 ? 0 : 6)}
              rx="3.5"
              ry="2"
              fill="var(--cream)"
              stroke="var(--plum)"
              strokeWidth="0.6"
              transform={`rotate(${i * 20} ${cx + dx} ${y + 30})`}
            />
          ))}
          {/* Chili */}
          <path
            d={`M ${cx + 70} ${y + 28} q 8 8, 6 18 q -3 -2, -6 -2 q 0 -8, 0 -16 z`}
            fill="#E85A4F"
          />
          <path d={`M ${cx + 70} ${y + 26} l -2 -4 l 4 0 z`} fill="#5BA85B" />
        </g>
      );
    case 3: // L4 DANCE — mehendi style swirls
      return (
        <g stroke="var(--plum)" strokeWidth="1.2" fill="none" opacity="0.85">
          <path d={`M ${cx - 60} ${y + 30} q 10 -10, 20 0 q 10 10, 20 0 q 10 -10, 20 0 q 10 10, 20 0`} strokeLinecap="round" />
          <circle cx={cx - 60} cy={y + 30} r="2.5" fill="var(--plum)" />
          <circle cx={cx + 60} cy={y + 30} r="2.5" fill="var(--plum)" />
          <path d={`M ${cx} ${y + 18} l 0 4 m -2 -2 l 4 0`} strokeWidth="1.5" />
        </g>
      );
    case 4: // L5 MUSIC — notes
      return (
        <g fill="var(--plum)">
          <g transform={`translate(${cx - 50}, ${y + 22})`}>
            <ellipse cx="0" cy="14" rx="5" ry="4" />
            <rect x="4" y="-2" width="1.6" height="18" />
          </g>
          <g transform={`translate(${cx - 5}, ${y + 18})`}>
            <ellipse cx="0" cy="18" rx="5" ry="4" />
            <ellipse cx="14" cy="14" rx="5" ry="4" />
            <rect x="4" y="-2" width="1.6" height="22" />
            <rect x="18" y="-6" width="1.6" height="22" />
            <path d="M 4 -2 q 16 -3, 16 -4" stroke="var(--plum)" strokeWidth="1.6" fill="none" />
          </g>
          <g transform={`translate(${cx + 45}, ${y + 24})`}>
            <ellipse cx="0" cy="12" rx="5" ry="4" />
            <rect x="4" y="-4" width="1.6" height="18" />
          </g>
        </g>
      );
    case 5: // L6 SAKURA — cherry blossoms
      return (
        <g>
          {[-30, 0, 30].map((dx, i) => (
            <g key={i} transform={`translate(${cx + dx}, ${y + 28})`}>
              {[0, 72, 144, 216, 288].map((rot) => (
                <ellipse
                  key={rot}
                  cx="0"
                  cy="-6"
                  rx="4"
                  ry="6"
                  fill="#FFD0E1"
                  stroke="#FF8FB8"
                  strokeWidth="0.6"
                  transform={`rotate(${rot})`}
                />
              ))}
              <circle r="2.5" fill="var(--yellow)" />
            </g>
          ))}
        </g>
      );
    default:
      return null;
  }
}

function Sparkles() {
  const sparkles = Array.from({ length: 10 }, (_, i) => ({
    x: 50 + Math.random() * 300,
    y: 60 + Math.random() * 300,
    d: i * 0.2,
    s: 0.6 + Math.random() * 0.8
  }));
  return (
    <g>
      {sparkles.map((sp, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, sp.s, 0] }}
          transition={{
            duration: 1.6,
            delay: sp.d,
            repeat: Infinity,
            repeatDelay: 0.6,
            ease: 'easeInOut'
          }}
          style={{ transformOrigin: `${sp.x}px ${sp.y}px` }}
        >
          <path
            d={`M ${sp.x} ${sp.y - 6} L ${sp.x + 1.5} ${sp.y - 1.5} L ${sp.x + 6} ${sp.y} L ${sp.x + 1.5} ${sp.y + 1.5} L ${sp.x} ${sp.y + 6} L ${sp.x - 1.5} ${sp.y + 1.5} L ${sp.x - 6} ${sp.y} L ${sp.x - 1.5} ${sp.y - 1.5} Z`}
            fill="#FFD56B"
          />
        </motion.g>
      ))}
    </g>
  );
}
