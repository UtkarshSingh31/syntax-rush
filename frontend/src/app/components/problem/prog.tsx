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
  const radius = 80;
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
      className="relative scale-[65%] md:scale-100 flex items-center justify-center  "
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
        <span className="text-gray-900  sm:text-3xl font-bold">
          {sublabel}
        </span>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { socket } from "@/socket";
import api from "@/lib/api";

export default function Prog({ battleId }: { battleId?: string | null }) {
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [myProgress, setMyProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null); // Added opponent state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data.data);
      } catch (err) {
        console.error("Auth failed", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (battleId && user) {
      socket.connect();
      socket.emit("join_battle", { battleId, user });

      socket.on("opponent_progress", ({ userId, progress }: { userId: string; progress: number }) => {
        if (userId !== user._id) {
          setOpponentProgress(progress);
        }
      });

      socket.on("room_state", (state: { players: { userId: string; progress: number }[] }) => {
        const otherPlayer = state.players.find((p: { userId: string }) => p.userId !== user._id);
        if (otherPlayer) {
          setOpponent(otherPlayer);
          setOpponentProgress(otherPlayer.progress); // Assuming setProgress refers to opponent's progress
        }
      });

      return () => {
        socket.off("opponent_progress");
        socket.off("room_state"); // Cleanup room_state listener
        socket.disconnect();
      };
    }
  }, [battleId, user]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-gray-100 rounded-[3.5rem] w-full p-10 transition-all shadow-sm">
      <div className="flex flex-col md:flex-row md:w-[70%] items-center justify-center md:justify-around gap-12 w-full">
        <div className="flex flex-col items-center">
          <CircularProgress
            value={myProgress}
            max={100}
            label="Me"
            sublabel={`${myProgress}%`}
          />
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-4">Current Progress</p>
        </div>

        {battleId && (
          <div className="flex flex-col items-center">
            <CircularProgress
              value={opponentProgress}
              max={100}
              label="Opponent"
              sublabel={`${opponentProgress}%`}
            />
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mt-4">Enemy Progress</p>
          </div>
        )}

        {!battleId && (
          <div className="flex flex-col items-center">
            <CircularProgress
              value={user?.performanceStats?.battleWon || 0}
              max={100}
              label="Victories"
              sublabel={`${user?.performanceStats?.battleWon || 0}`}
            />
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-4">Battle Stats</p>
          </div>
        )}
      </div>

      <div className="hidden md:flex flex-col gap-6 pl-12 border-l border-gray-50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global Time</span>
          </div>
          <p className="text-2xl font-black text-[#232B36]">3h <span className="text-gray-300">40m</span></p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Monthly Goal</span>
          </div>
          <p className="text-2xl font-black text-[#232B36]">6d <span className="text-gray-300">9h</span></p>
        </div>
      </div>
    </div>
  );
}
