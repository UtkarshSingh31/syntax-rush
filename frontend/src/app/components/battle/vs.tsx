"use client";
import React, { useState } from "react";
import NavBar from "../navBar";

export default function Vs() {
  const [mode, setMode] = useState<"solo" | "multi">("solo");
  const [type, setType] = useState("quick");

  return (
    <div className="w-full min-h-[80vh] flex flex-col bg-[#f7f8fa]">
      <div className="flex-1 flex flex-col items-center justify-center pb-12">
        <div className="flex gap-2 mt-20 ">
          <button
            className={`px-6 py-2 rounded-full font-medium  transition ${
              mode === "solo"
                ? "bg-[#232b36] text-white font-semibold"
                : "bg-transparent text-gray-400 "
            }`}
            onClick={() => setMode("solo")}
          >
            Solo
          </button>
          <button
            className={`px-6 py-2 rounded-full font-medium transition ${
              mode === "multi"
                ? "bg-[#232b36] text-white font-semibold"
                : "bg-transparent text-gray-400 "
            }`}
            onClick={() => setMode("multi")}
          >
            Multiplayer
          </button>
        </div>
        <div className="flex flex-1 w-[70vw] items-center justify-between  gap-32">
          <div className="flex flex-col items-center">
            <div className="w-56 h-56 rounded-full bg-gray-200" />
            <span className="mt-6 text-md text-gray-800">player-1</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-md text-gray-600 mb-2">v/s</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-56 h-56 rounded-full bg-gray-200" />
            <span className="mt-6 text-md text-gray-800">player-2</span>
          </div>
        </div>

        <div className="flex flex-col items-center ">
          <select
            className="mb-3 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm border-none focus:ring-2 focus:ring-gray-200"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="quick">quick</option>
            <option value="custom">custom</option>
          </select>
          <button className="px-10 py-2 rounded-full bg-[#232b36] text-white font-medium text-lg shadow">
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
