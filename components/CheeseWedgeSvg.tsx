import React from 'react';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export function CheeseWedgeSvg({ size = 120, color = '#F6A623' }: Props) {
  return (
    <Svg width={size} height={size * 0.75} viewBox="0 0 160 120">
      {/* Wedge body */}
      <Path
        d="M10 110 L80 10 L150 110 Z"
        fill={color}
        stroke="#D4891A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Bottom rind */}
      <Path
        d="M10 110 Q80 124 150 110"
        fill="#E8C04A"
        stroke="#D4891A"
        strokeWidth="3"
      />
      {/* Holes */}
      <Circle cx="70" cy="72" r="9" fill="#D4891A" opacity="0.4" />
      <Circle cx="100" cy="85" r="6" fill="#D4891A" opacity="0.4" />
      <Circle cx="60" cy="90" r="5" fill="#D4891A" opacity="0.4" />
      <Circle cx="90" cy="60" r="7" fill="#D4891A" opacity="0.4" />
    </Svg>
  );
}
