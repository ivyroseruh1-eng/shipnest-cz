import { motion } from "framer-motion";
import { Plane } from "lucide-react";

interface Waypoint {
  label: string;
  sub?: string;
}

interface Props {
  origin: Waypoint;
  destination: Waypoint;
  /** 0 - 1 progress along the arc */
  progress?: number;
  height?: number;
  className?: string;
  /** Skip path-draw animation (used on tracking once mounted) */
  animate?: boolean;
}

// Quadratic Bezier point at t
const bezier = (t: number, p0: [number, number], p1: [number, number], p2: [number, number]): [number, number] => {
  const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
  const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
  return [x, y];
};

const RouteMap = ({ origin, destination, progress = 0, height = 180, className = "", animate = true }: Props) => {
  const W = 800;
  const H = 220;
  const P0: [number, number] = [80, 160];
  const P1: [number, number] = [400, 20];
  const P2: [number, number] = [720, 160];

  const t = Math.min(Math.max(progress, 0), 1);
  const [px, py] = bezier(t, P0, P1, P2);
  // tangent angle for plane rotation
  const [nx, ny] = bezier(Math.min(t + 0.02, 1), P0, P1, P2);
  const angle = (Math.atan2(ny - py, nx - px) * 180) / Math.PI;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ height }} role="img" aria-label={`Route from ${origin.label} to ${destination.label}`}>
        <defs>
          <linearGradient id="arcGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="arcGlow" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* glow */}
        <ellipse cx="400" cy="170" rx="320" ry="40" fill="url(#arcGlow)" />

        {/* dashed background arc */}
        <path d={`M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`}
          fill="none" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 6" />

        {/* progress arc */}
        <motion.path
          d={`M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`}
          fill="none" stroke="url(#arcGrad)" strokeWidth="3" strokeLinecap="round"
          pathLength={1}
          initial={animate ? { pathLength: 0 } : false}
          animate={{ pathLength: t }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />

        {/* origin pin */}
        <g>
          <circle cx={P0[0]} cy={P0[1]} r="8" fill="hsl(var(--primary))" />
          <circle cx={P0[0]} cy={P0[1]} r="3" fill="hsl(var(--background))" />
          <text x={P0[0]} y={P0[1] + 26} textAnchor="middle" fontSize="13" fontWeight="600" fill="hsl(var(--foreground))">{origin.label}</text>
          {origin.sub && <text x={P0[0]} y={P0[1] + 42} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">{origin.sub}</text>}
        </g>

        {/* destination pin */}
        <g>
          <circle cx={P2[0]} cy={P2[1]} r="8" fill="hsl(var(--success))" />
          <circle cx={P2[0]} cy={P2[1]} r="3" fill="hsl(var(--background))" />
          <text x={P2[0]} y={P2[1] + 26} textAnchor="middle" fontSize="13" fontWeight="600" fill="hsl(var(--foreground))">{destination.label}</text>
          {destination.sub && <text x={P2[0]} y={P2[1] + 42} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">{destination.sub}</text>}
        </g>

        {/* plane at current position */}
        {t > 0 && t < 1 && (
          <motion.g
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            transform={`translate(${px} ${py}) rotate(${angle})`}
          >
            <circle r="14" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" />
            <g transform="translate(-7 -7)" color="hsl(var(--primary))">
              <Plane width={14} height={14} strokeWidth={2.2} />
            </g>
            <motion.circle r="14" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
              animate={{ r: [14, 24], opacity: [0.6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.g>
        )}
      </svg>
    </div>
  );
};

export default RouteMap;