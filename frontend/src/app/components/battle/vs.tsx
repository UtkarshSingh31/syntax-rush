"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function Vs() {
  const router = useRouter();
  const [showGroup, setShowGroup] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDeltaX, setDragDeltaX] = useState(0);

  const candidateOpponents = useMemo(
    () => [
      "ShadowCoder",
      "AlgoKnight",
      "SpeedTyper",
      "BugHunter",
      "StackWizard",
      "NullTerminator",
      "BitNinja",
    ],
    []
  );

  useEffect(() => {
    if (!isSearching) return;
    setProgress(0);
    setOpponent(null);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + Math.floor(Math.random() * 12) + 5);
        if (next > 70 && !opponent) {
          const pick = candidateOpponents[Math.floor(Math.random() * candidateOpponents.length)];
          setOpponent(pick);
        }
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isSearching, candidateOpponents, opponent]);

  useEffect(() => {
    if (progress >= 100 && isSearching) {
      // brief pause before enabling start
      const t = setTimeout(() => {}, 500);
      return () => clearTimeout(t);
    }
  }, [progress, isSearching]);

  const onStartMatchmaking = () => {
    setIsSearching(true);
  };

  const onCancelMatchmaking = () => {
    setIsSearching(false);
    setProgress(0);
    setOpponent(null);
  };

  const onBeginBattle = () => {
    router.push("/problem");
  };

  const [matchType, setMatchType] = useState<"quick" | "1v1 classic" | "friendly">("quick");

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] bg-[#F7F8FD] overflow-hidden">
      {/* Ambient background shapes */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-gray-200 to-gray-100 blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-gray-200 to-white blur-3xl opacity-70" />
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="mx-auto max-w-[1100px] px-6 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-white/90 backdrop-blur shadow px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="text-sm text-gray-700">Bronze II</div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-700"><span>⭐</span><span>2,450</span></div>
              <div className="flex items-center gap-1 text-gray-700"><span>💰</span><span>1,120</span></div>
              <button className="px-3 py-1 rounded-full border text-gray-700 text-xs">Inbox</button>
            </div>
          </div>
        </div>
      </div>
      <button
        className="absolute top-4 right-6 z-10 px-4 py-2 rounded-full bg-[#232b36] text-white text-sm shadow"
        onClick={() => setShowGroup(true)}
      >
        Group {">"}
      </button>

      <div
        className={`flex w-[200%] transition-transform duration-500 ease-in-out ${
          showGroup ? "-translate-x-1/2" : "translate-x-0"
        }`}
      >
        {/* Home page */}
        <section className="w-1/2 flex items-start justify-center py-20">
          <div className="w-full max-w-[1100px] px-6">
            {/* Page header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Solo Battle</h1>
                <p className="text-xs text-gray-500">Find a fair opponent and climb the ranks</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-full border text-xs text-gray-700">Rules</button>
                <button className="px-3 py-1.5 rounded-full border text-xs text-gray-700">Leaderboard</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12">
            {/* Left column */}
            <div className="flex flex-col items-center gap-6">
              <div className="w-44 h-44 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner" />
              <span className="text-sm text-gray-700">You</span>
              {/* Start moved to selector card */}
              {/* Solo stats */}
              <div className="w-full rounded-2xl bg-white shadow-md p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-800">Solo Mode</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">1 Player</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Win rate</div>
                    <div className="text-sm font-semibold text-gray-800">62%</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Best streak</div>
                    <div className="text-sm font-semibold text-gray-800">18</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Total wins</div>
                    <div className="text-sm font-semibold text-gray-800">124</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white shadow-xl p-6 w-full border border-gray-100">
              {/* Top metrics like problem page */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border bg-white p-4 flex items-center justify-center">
                  <div className="relative w-36 h-36">
                    <div className="absolute inset-0 rounded-full" style={{background: `conic-gradient(#6366f1 ${95*3.6}deg, #e5e7eb 0deg)`}} />
                    <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Total battles</div>
                        <div className="text-lg font-semibold text-gray-900">130/250</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border bg-white p-4 flex items-center justify-center">
                  <div className="relative w-36 h-36">
                    <div className="absolute inset-0 rounded-full" style={{background: `conic-gradient(#6366f1 ${85*3.6}deg, #e5e7eb 0deg)`}} />
                    <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Win rate</div>
                        <div className="text-lg font-semibold text-gray-900">95%</div>
                      </div>
                    </div>
                  </div>
                </div>
 
              </div>

              {/* List of modes like problem list */}
              <ul className="space-y-3 max-h-[360px] overflow-auto pr-1">
                {[
                  { title: "Quick match", win: 63.2, tag: "Easy", type: "quick" },
                  { title: "1v1 Classic", win: 69.2, tag: "Hard", type: "1v1 classic" },
                  { title: "Friendly", win: 53.2, tag: "Medium", type: "friendly" },

                ].map((row, i) => (
                  <li key={i} className="flex items-center justify-between rounded-xl border bg-white p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm">{i+1}.</span>
                      <span className="text-gray-800 text-sm">{row.title}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                      <span className="text-xs text-gray-500">{row.win}%</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${row.tag==="Easy"?"bg-green-100 text-green-600":row.tag==="Hard"?"bg-red-100 text-red-600":"bg-yellow-100 text-yellow-700"}`}>{row.tag}</span>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-full bg-[#232b36] text-white text-xs"
                      onClick={() => { setMatchType(row.type as any); onStartMatchmaking(); }}
                    >
                      Start
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            </div>
          </div>
        </section>

        {/* Group page */}
        <section className="w-1/2 flex items-center justify-center py-12">
          <div className="relative w-full max-w-[1100px] px-6">
            <button
              className="absolute -top-2 right-0 md:right-2 px-4 py-2 rounded-full bg-white text-gray-700 shadow"
              onClick={() => setShowGroup(false)}
            >
              {"<"}
            </button>
            <div className="rounded-2xl bg-white shadow p-8 min-h-[500px] flex items-center justify-center text-gray-600">
              Group page content
            </div>
          </div>
        </section>
      </div>
      {/* Matchmaking overlay */}
      {isSearching && (
        <div className="absolute inset-0 bg-[#0b1220]/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="w-full max-w-[560px] rounded-2xl bg-white shadow-lg p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-800 font-semibold">Finding players...</h3>
              <button className="text-sm text-gray-500 hover:text-gray-700" onClick={onCancelMatchmaking}>Cancel</button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Type: {matchType}</p>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-[#232b36] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-gray-500 w-10 text-right">{progress}%</span>
            </div>

            <div className="grid grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200" />
                <span className="mt-3 text-sm text-gray-700">You</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full ${opponent ? "bg-gray-200" : "bg-gray-100 animate-pulse"}`} />
                <span className="mt-3 text-sm text-gray-500">{opponent || "Searching..."}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              {progress >= 100 ? (
                <button className="px-4 py-2 rounded-full bg-[#232b36] text-white" onClick={onBeginBattle}>
                  Start Battle
                </button>
              ) : (
                <span className="text-xs text-gray-500">Matching players and problems...</span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}