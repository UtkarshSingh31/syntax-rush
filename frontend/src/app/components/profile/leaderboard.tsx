"use client";
import React from "react";
import { useMemo, useState } from "react";

type SoloRow = { name: string; score: number; battles: number };
type GroupRow = { team: string; members: number; score: number; battles: number };

const soloData: SoloRow[] = [
  { name: "player-1", score: 980, battles: 42 },
  { name: "player-2", score: 920, battles: 40 },
  { name: "player-3", score: 860, battles: 37 },
  { name: "player-4", score: 820, battles: 35 },
  { name: "player-5", score: 780, battles: 31 },
  { name: "player-6", score: 740, battles: 29 },
  { name: "player-7", score: 700, battles: 27 },
  { name: "player-1", score: 980, battles: 42 },
  { name: "player-2", score: 920, battles: 40 },
  { name: "player-3", score: 860, battles: 37 },
  { name: "player-4", score: 820, battles: 35 },
  { name: "player-5", score: 780, battles: 31 },
  { name: "player-6", score: 740, battles: 29 },
  { name: "player-7", score: 700, battles: 27 },
  { name: "player-1", score: 980, battles: 42 },
  { name: "player-2", score: 920, battles: 40 },
  { name: "player-3", score: 860, battles: 37 },
  { name: "player-4", score: 820, battles: 35 },
  { name: "player-5", score: 780, battles: 31 },
  { name: "player-6", score: 740, battles: 29 },
  { name: "player-7", score: 700, battles: 27 },
  { name: "player-1", score: 980, battles: 42 },
  { name: "player-2", score: 920, battles: 40 },
  { name: "player-3", score: 860, battles: 37 },
  { name: "player-4", score: 820, battles: 35 },
  { name: "player-5", score: 780, battles: 31 },
  { name: "player-6", score: 740, battles: 29 },
  { name: "player-7", score: 700, battles: 27 },
];

const groupData: GroupRow[] = [
  { team: "Alpha Coders", members: 5, score: 2150, battles: 96 },
  { team: "Bug Smashers", members: 4, score: 1990, battles: 88 },
  { team: "Runtime Terrors", members: 6, score: 1880, battles: 81 },
  { team: "Null Pointers", members: 5, score: 1760, battles: 74 },
  { team: "Semicolon Squad", members: 4, score: 1650, battles: 70 },
  { team: "Alpha Coders", members: 5, score: 2150, battles: 96 },
  { team: "Bug Smashers", members: 4, score: 1990, battles: 88 },
  { team: "Runtime Terrors", members: 6, score: 1880, battles: 81 },
  { team: "Null Pointers", members: 5, score: 1760, battles: 74 },
  { team: "Semicolon Squad", members: 4, score: 1650, battles: 70 },
  { team: "Alpha Coders", members: 5, score: 2150, battles: 96 },
  { team: "Bug Smashers", members: 4, score: 1990, battles: 88 },
  { team: "Runtime Terrors", members: 6, score: 1880, battles: 81 },
  { team: "Null Pointers", members: 5, score: 1760, battles: 74 },
  { team: "Semicolon Squad", members: 4, score: 1650, battles: 70 },
  { team: "Alpha Coders", members: 5, score: 2150, battles: 96 },
  { team: "Bug Smashers", members: 4, score: 1990, battles: 88 },
  { team: "Runtime Terrors", members: 6, score: 1880, battles: 81 },
  { team: "Null Pointers", members: 5, score: 1760, battles: 74 },
  { team: "Semicolon Squad", members: 4, score: 1650, battles: 70 },
  { team: "Alpha Coders", members: 5, score: 2150, battles: 96 },
  { team: "Bug Smashers", members: 4, score: 1990, battles: 88 },
  { team: "Runtime Terrors", members: 6, score: 1880, battles: 81 },
  { team: "Null Pointers", members: 5, score: 1760, battles: 74 },
  { team: "Semicolon Squad", members: 4, score: 1650, battles: 70 },
];

export default function Leaderboard() {
  const [mode, setMode] = useState<"solo" | "group">("solo");

  const rows = useMemo(() => {
    if (mode === "solo") {
      return [...soloData].sort((a, b) => b.score - a.score);
    }
    return [...groupData].sort((a, b) => b.score - a.score);
  }, [mode]);

  return (
    <div className="w-full min-h-screen bg-[#F7F8FD]">
      {/* Header + Toggle */}
      <div className="max-w-[1100px] mx-auto px-6 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Leaderboard</h1>
          <div className="flex gap-2">
            <button
              className={`px-5 py-2 rounded-full text-sm transition ${
                mode === "solo"
                  ? "bg-[#232b36] text-white"
                  : "bg-white text-gray-500 shadow"
              }`}
              onClick={() => setMode("solo")}
            >
              Solo
            </button>
            <button
              className={`px-5 py-2 rounded-full text-sm transition ${
                mode === "group"
                  ? "bg-[#232b36] text-white"
                  : "bg-white text-gray-500 shadow"
              }`}
              onClick={() => setMode("group")}
            >
              Group
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-y-auto h-[85vh]">
          <div className="grid grid-cols-12 px-6 py-3 text-xs font-medium text-gray-500 border-b">
            <div className="col-span-1">Rank</div>
            <div className="col-span-6 md:col-span-6">
              {mode === "solo" ? "Player" : "Team"}
            </div>
            {mode === "group" && <div className="hidden md:block col-span-2">Members</div>}
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-3 md:col-span-2 text-right">Battles</div>
          </div>

          <ul>
            {rows.map((row, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

              return (
                <li
                  key={idx}
                  className="grid grid-cols-12 items-center px-6 py-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div className={`col-span-1 ${isTop3 ? "text-yellow-500" : "text-gray-400"}`}>
                    {medal || `${rank}.`}
                  </div>
                  <div className="col-span-6 md:col-span-6 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-200" />
                    <span className="text-gray-800 text-sm">
                      {mode === "solo" ? (row as SoloRow).name : (row as GroupRow).team}
                    </span>
                  </div>
                  {mode === "group" && (
                    <div className="hidden md:block col-span-2 text-gray-500 text-sm">
                      {(row as GroupRow).members}
                    </div>
                  )}
                  <div className="col-span-2 text-right text-gray-800 text-sm">
                    {mode === "solo" ? (row as SoloRow).score : (row as GroupRow).score}
                  </div>
                  <div className="col-span-3 md:col-span-2 text-right text-gray-500 text-sm">
                    {mode === "solo" ? (row as SoloRow).battles : (row as GroupRow).battles}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
