"use client";
import React from "react";

function CircularProgress({
  value,
  max,
  label,
  sublabel,
}: {
  value: number;
  max: number;
  label: string;
  sublabel: string;
}) {
  const radius = 95;
  const stroke = 4;
  const dotRadius = 6;
  const padding = dotRadius + 2;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = (value / max) * circumference;

  const angle = -2 * Math.PI * (value / max) - Math.PI / 2;
  const dotX = radius + padding + normalizedRadius * Math.cos(angle);
  const dotY = radius + padding + normalizedRadius * Math.sin(angle);

  const svgSize = radius * 2 + padding * 2;

  return (
    <div
      className="relative scale-[65%] md:scale-100 flex items-center justify-center "
      style={{ width: svgSize, height: svgSize }}
    >
      <svg height={svgSize} width={svgSize}>
        <circle
          stroke="#EBEBF3"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius + padding}
          cy={radius + padding}
        />
        <circle
          stroke="#6266F0"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius + padding}
          cy={radius + padding}
          strokeDasharray={circumference}
          strokeDashoffset={circumference + progress}
          style={{ transition: "stroke-dashoffset 0.5s" }}
          transform={`rotate(-90 ${radius + padding} ${radius + padding})`}
        />
        <circle cx={dotX} cy={dotY} r={dotRadius} fill="#6266F0" />
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none">
        <span className="text-gray-500 text-xs mb-1">{label}</span>
        <span className="text-gray-900 text-2xl sm:text-3xl font-bold">
          {sublabel}
        </span>
      </div>
    </div>
  );
}

export default function Prog() {
  return (
    <div className="flex mt-5 flex-col md:flex-row justify-between items-center bg-white border-4 border-[#EBEBF3] rounded-3xl w-full h-fit p-6">
      <div className="flex flex-row md:w-[60%] items-center md:justify-between">
        <CircularProgress
          value={130}
          max={250}
          label="Total questions"
          sublabel="130/250"
        />

        <CircularProgress
          value={95}
          max={100}
          label="Accuracy Rate"
          sublabel="95%"
        />
      </div>

      <div className="flex scale-90 md:scale-100 flex-col mt-6 text-center items-center">
        <div className="mb-4">
          <span className="text-[#6266F0] text-2xl sm:text-3xl font-semibold">
            <span className="text-gray-900">3h</span> 40min
          </span>
          <div className="text-gray-400 text-xs sm:text-sm">this week</div>
        </div>
        <div>
          <span className="text-[#6266F0] text-2xl sm:text-3xl font-semibold">
            <span className="text-gray-900">6d 9h</span> 25min
          </span>
          <div className="text-gray-400 text-xs sm:text-sm">this month</div>
        </div>
      </div>
    </div>
  );
}
