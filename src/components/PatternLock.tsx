import React from 'react';

interface PatternLockProps {
  pattern: number[]; // Array of indices 0-8
  onChange?: (newPattern: number[]) => void;
  readOnly?: boolean;
  size?: number;
}

export const PatternLock: React.FC<PatternLockProps> = ({
  pattern,
  onChange,
  readOnly = false,
  size = 180,
}) => {
  // Grid is 3x3 (coordinates 0 to 2)
  const dotCoords = [
    { x: 30, y: 30, id: 0 },
    { x: 90, y: 30, id: 1 },
    { x: 150, y: 30, id: 2 },
    { x: 30, y: 90, id: 3 },
    { x: 90, y: 90, id: 4 },
    { x: 150, y: 90, id: 5 },
    { x: 30, y: 150, id: 6 },
    { x: 90, y: 150, id: 7 },
    { x: 150, y: 150, id: 8 },
  ];

  const handleDotClick = (id: number) => {
    if (readOnly || !onChange) return;
    if (pattern.includes(id)) {
      // If clicking already selected, remove up to that dot or remove it
      const index = pattern.indexOf(id);
      if (index === pattern.length - 1) {
        onChange(pattern.slice(0, -1));
      } else {
        onChange(pattern.slice(0, index + 1));
      }
    } else {
      onChange([...pattern, id]);
    }
  };

  const handleClear = () => {
    if (onChange) onChange([]);
  };

  // Build SVG path string connecting dots
  const pathD = pattern
    .map((dotId, index) => {
      const coord = dotCoords[dotId];
      if (!coord) return '';
      return `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative bg-neutral-900 rounded-xl p-3 shadow-inner border border-neutral-800"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 180 180"
          className="w-full h-full select-none"
        >
          {/* Connector lines */}
          {pattern.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-150"
            />
          )}

          {/* Dots */}
          {dotCoords.map((coord) => {
            const isSelected = pattern.includes(coord.id);
            const order = pattern.indexOf(coord.id) + 1;

            return (
              <g
                key={coord.id}
                onClick={() => handleDotClick(coord.id)}
                className={readOnly ? 'cursor-default' : 'cursor-pointer group'}
              >
                {/* Touch target circle */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r="20"
                  fill="transparent"
                />

                {/* Outer ring */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelected ? '14' : '10'}
                  fill={isSelected ? '#0369a1' : '#262626'}
                  stroke={isSelected ? '#38bdf8' : '#404040'}
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* Inner center dot */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelected ? '6' : '4'}
                  fill={isSelected ? '#ffffff' : '#a3a3a3'}
                />

                {/* Order indicator number */}
                {isSelected && (
                  <text
                    x={coord.x}
                    y={coord.y - 15}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {order}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {!readOnly && onChange && (
        <div className="mt-2 flex items-center justify-between w-full max-w-[180px] text-xs">
          <span className="text-neutral-500 font-mono">
            {pattern.length > 0
              ? pattern.map(p => p + 1).join('→')
              : 'Toque nos pontos'}
          </span>
          {pattern.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-amber-600 hover:text-amber-700 font-medium underline"
            >
              Limpar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
