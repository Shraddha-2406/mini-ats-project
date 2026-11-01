import React from 'react';
import { getScoreColor } from '../../utils/helpers';

export default function MatchScoreRing({ score = 0, size = 'md', showLabel = true }) {
  const safeScore = Math.min(100, Math.max(0, Math.round(score)));
  const colorMeta = getScoreColor(safeScore);

  const configs = {
    sm: { diameter: 48, strokeWidth: 4, textSize: 'text-xs font-bold', subText: '' },
    md: { diameter: 72, strokeWidth: 6, textSize: 'text-sm font-bold', subText: 'text-[9px]' },
    lg: { diameter: 104, strokeWidth: 8, textSize: 'text-xl font-extrabold', subText: 'text-xs' },
    xl: { diameter: 140, strokeWidth: 10, textSize: 'text-3xl font-extrabold', subText: 'text-xs' },
  };

  const { diameter, strokeWidth, textSize, subText } = configs[size] || configs.md;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90 transition-all duration-700 ease-out"
      >
        {/* Background track circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Active progress stroke */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={colorMeta.ring}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`${textSize} ${colorMeta.text}`}>
          {safeScore}%
        </span>
        {showLabel && size !== 'sm' && (
          <span className={`font-medium text-slate-400 uppercase tracking-wider ${subText}`}>
            Match
          </span>
        )}
      </div>
    </div>
  );
}

