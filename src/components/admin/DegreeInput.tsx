import { useState, useCallback, useRef } from 'react';
import { cn } from '@/utils/cn';
import { normalizeDegree } from '@/utils/degree';

interface DegreeInputProps {
  value: number;
  onChange: (deg: number) => void;
  label?: string;
  error?: string;
}

const COMPASS_LABELS = [
  { deg: 0, label: 'N' },
  { deg: 90, label: 'E' },
  { deg: 180, label: 'S' },
  { deg: 270, label: 'W' },
];

export function DegreeInput({ value, onChange, label, error }: DegreeInputProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getSvgCenter = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return { cx: 80, cy: 80 };
    const rect = svg.getBoundingClientRect();
    return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
  }, []);

  const coordsToDeg = useCallback(
    (clientX: number, clientY: number) => {
      const { cx, cy } = getSvgCenter();
      const dx = clientX - cx;
      const dy = clientY - cy;
      // atan2 gives angle from positive X; we want angle from positive Y (north)
      const radians = Math.atan2(dx, -dy);
      const deg = ((radians * 180) / Math.PI + 360) % 360;
      return Math.round(deg);
    },
    [getSvgCenter]
  );

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    onChange(normalizeDegree(coordsToDeg(e.clientX, e.clientY)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const onMove = (ev: PointerEvent) => {
      onChange(normalizeDegree(coordsToDeg(ev.clientX, ev.clientY)));
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Handle position on the circle
  const RADIUS = 56;
  const CENTER = 80;
  const rad = ((value - 90) * Math.PI) / 180; // -90 so 0° points up
  const handleX = CENTER + RADIUS * Math.cos(rad);
  const handleY = CENTER + RADIUS * Math.sin(rad);

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) onChange(normalizeDegree(v));
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      <div className="flex flex-col items-center gap-4">
        {/* Compass rose */}
        <div className="w-full max-w-[280px] aspect-square mx-auto">
          <svg
            ref={svgRef}
            viewBox="0 0 160 160"
            className={cn(
              'w-full h-full cursor-crosshair rounded-full border-2 transition-colors select-none touch-none',
            isDragging ? 'border-accent' : 'border-gray-200 hover:border-gray-300',
            error ? 'border-danger' : ''
          )}
          onClick={handleSvgClick}
          aria-label="Compass rose degree picker"
        >
          {/* Background circles */}
          <circle cx="80" cy="80" r="76" fill="#F9FAFB" />
          <circle cx="80" cy="80" r="56" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="80" cy="80" r="3" fill="#6B7280" />

          {/* Tick marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const tickDeg = i * 10;
            const tickRad = ((tickDeg - 90) * Math.PI) / 180;
            const isCardinal = tickDeg % 90 === 0;
            const r1 = isCardinal ? 62 : 65;
            const r2 = 70;
            return (
              <line
                key={tickDeg}
                x1={80 + r1 * Math.cos(tickRad)}
                y1={80 + r1 * Math.sin(tickRad)}
                x2={80 + r2 * Math.cos(tickRad)}
                y2={80 + r2 * Math.sin(tickRad)}
                stroke={isCardinal ? '#9CA3AF' : '#D1D5DB'}
                strokeWidth={isCardinal ? 2 : 1}
              />
            );
          })}

          {/* Cardinal labels */}
          {COMPASS_LABELS.map(({ deg: d, label: l }) => {
            const r = ((d - 90) * Math.PI) / 180;
            const lx = 80 + 46 * Math.cos(r);
            const ly = 80 + 46 * Math.sin(r);
            return (
              <text
                key={l}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="600"
                fill={d === 0 ? '#2563EB' : '#6B7280'}
              >
                {l}
              </text>
            );
          })}

          {/* Direction line */}
          <line
            x1="80"
            y1="80"
            x2={handleX}
            y2={handleY}
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Draggable handle */}
          <circle
            cx={handleX}
            cy={handleY}
            r="8"
            fill="#2563EB"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
          />

          {/* Center degree display */}
          <text
            x="80"
            y="80"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            fontWeight="700"
            fill="#111827"
          >
            {value.toFixed(0)}°
          </text>
        </svg>
        </div>

        {/* Numeric input */}
        <div className="flex items-center gap-2 w-full max-w-[280px]">
          <span className="text-sm text-gray-600 whitespace-nowrap">Degree:</span>
          <input
            type="number"
            min="0"
            max="359"
            step="1"
            value={value}
            onChange={handleNumberInput}
            aria-label="Degree value"
            className={cn(
              'w-full h-11 border rounded-lg px-3 py-2 text-base text-gray-900 text-center',
              'focus:outline-none focus:ring-2 focus:ring-accent font-mono',
              error ? 'border-danger' : 'border-gray-300'
            )}
          />
          <span className="text-sm text-gray-500">°</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 max-w-[280px]">
        0° = the direction the camera faces when scene loads (north/forward).
        Set the degree to match where this path physically leads in the panorama image.
      </p>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
