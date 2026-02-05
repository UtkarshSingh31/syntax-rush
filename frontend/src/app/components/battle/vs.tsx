"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, Zap, Trophy, Shield, Users, Target, Search, X, Loader2, ArrowRight, ChevronRight, ChevronLeft, Crown, Star, Inbox } from "lucide-react";

import { socket } from "@/socket";
import api from "@/lib/api";

export default function Vs() {
  const router = useRouter();
  const [showGroup, setShowGroup] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [opponent, setOpponent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [battle, setBattle] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data.data.user);
      } catch (err) {
        console.error("Auth failed", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isSearching) return;

    // Simulate matchmaking progress or wait for socket event
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90 && !opponent) return p; // Wait for opponent
        return Math.min(100, p + Math.floor(Math.random() * 5) + 1);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isSearching, opponent]);

  useEffect(() => {
    if (!battle?._id || !user) return;

    socket.connect();
    socket.emit("join_battle", { battleId: battle._id, user });

    socket.on("room_state", (state: any) => {
      const otherPlayer = state.players.find((p: any) => String(p.userId) !== String(user._id));
      if (otherPlayer) {
        setOpponent(otherPlayer);
        setProgress(100);
      }
    });

    return () => {
      socket.off("room_state");
    };
  }, [battle?._id, user]);

  useEffect(() => {
    socket.on("match_found", ({ battle, opponent }) => {
      setBattle(battle);
      setOpponent(opponent);
      setProgress(100);
    });

    socket.on("match_error", (err) => {
      alert(err);
      setIsSearching(false);
    });

    return () => {
      socket.off("match_found");
      socket.off("match_error");
    };
  }, []);

  const [matchType, setMatchType] = useState<"1v1_quick" | "1v1_classic" | "1v1_friendly">("1v1_quick");

  const onStartMatchmaking = async (type: string) => {
    if (!user) {
      alert("Please login first");
      return;
    }
    setIsSearching(true);
    setProgress(0);
    setOpponent(null);
    setMatchType(type as any);

    socket.connect();
    socket.emit("start_matchmaking", { user, matchType: type });
  };

  const onCancelMatchmaking = () => {
    setIsSearching(false);
    setProgress(0);
    setOpponent(null);
    setBattle(null);
    socket.emit("cancel_matchmaking", { userId: user?._id });
  };

  const onBeginBattle = () => {
    if (battle?._id) {
      router.push(`/problem?battleId=${battle._id}`);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#F7F8FD] overflow-hidden pt-24 pb-20">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/40 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />

      {/* Group Toggle Button */}
      <button
        onClick={() => setShowGroup(!showGroup)}
        className="fixed top-28 right-6 z-50 px-6 py-3 rounded-2xl bg-[#232B36] text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 flex items-center gap-3 hover:scale-105 transition-all group"
      >
        {showGroup ? <ChevronLeft size={16} /> : null}
        {showGroup ? "Back to Solo" : "Group Battle"}
        {!showGroup ? <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /> : null}
      </button>

      <div
        className={`flex w-[200%] transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${showGroup ? "-translate-x-1/2" : "translate-x-0"
          }`}
      >
        {/* SOLO BATTLE SECTION */}
        <section className="w-1/2 px-6">
          <div className="container mx-auto">

            {/* Header HUD */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-6 p-1 bg-white rounded-[2rem] shadow-sm border border-gray-100 pr-8">
                <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-[#6266F0]">
                  <CrownIcon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#232B36]">BATTLE HUB</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.username || 'GUEST'}&apos;s Matchmaking</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className="font-black text-sm">{user?.performanceStats?.totalPoints || 0} <span className="text-gray-400 font-bold">PTS</span></span>
                </div>
                <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                  <Inbox size={16} className="text-indigo-500" />
                  <span className="font-black text-xs uppercase tracking-widest">Inbox</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* Left Stats Column */}
              <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                <div className="bg-[#232B36] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white/10 p-1 mb-6 relative">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse" />
                      {user?.avatar ? (
                        <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="avatar" />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center font-black text-3xl">
                          {user?.username?.substring(0, 2).toUpperCase() || "UN"}
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter">{user?.username || "Guest"}</h3>
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">{user?.performanceStats?.currentLeague || "Standard"}</span>

                    <div className="grid grid-cols-3 gap-3 w-full mt-10">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                        <p className="text-[9px] text-white/40 font-bold uppercase mb-1">Win Rate</p>
                        <p className="text-sm font-black text-white">62%</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                        <p className="text-[9px] text-white/40 font-bold uppercase mb-1">Streak</p>
                        <p className="text-sm font-black text-indigo-400">18</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                        <p className="text-[9px] text-white/40 font-bold uppercase mb-1">Wins</p>
                        <p className="text-sm font-black text-white">{user?.performanceStats?.battleWon || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h4 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-6 px-2 text-center">Battle Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-gray-50 rounded-3xl text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Total Battles</p>
                      <div className="text-xl font-black text-[#232B36]">{user?.performanceStats?.battleParticipated || 0}<span className="text-gray-300">/250</span></div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Efficiency</p>
                      <div className="text-xl font-black text-[#6266F0]">95%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Selection Column */}
              <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">

                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                  <div className="mb-10">
                    <h3 className="text-2xl font-black text-[#232B36]">Solo Arena</h3>
                    <p className="text-gray-400 font-medium">Challenge the global network and climb the leaderboards.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "Quick Match", win: "63.2%", diff: "Easy", type: "1v1_quick", desc: "Fast matchmaking, random problems." },
                      { title: "1v1 Classic", win: "69.2%", diff: "Hard", type: "1v1_classic", desc: "Standard competitive format." },
                      { title: "Friendly", win: "53.2%", diff: "Medium", type: "1v1_friendly", desc: "Unrated match with a friend." }
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2rem] border border-transparent hover:border-indigo-100/50 hover:bg-indigo-50/30 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-xs text-gray-400 border border-gray-100">
                            0{i + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#232B36]">{row.title}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{row.desc}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-12">
                          <div className="hidden md:block text-right">
                            <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Win Rate</p>
                            <span className="text-xs font-black text-indigo-500">{row.win}</span>
                          </div>
                          <div className="hidden md:block text-center">
                            <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Tier</p>
                            <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-tighter ${row.diff === 'Hard' ? 'bg-red-50 text-red-500' : row.diff === 'Easy' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>{row.diff}</span>
                          </div>
                          <button
                            onClick={() => { setMatchType(row.type as any); onStartMatchmaking(row.type); }}
                            className="px-8 py-3 bg-[#232B36] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#6266F0] transition-all"
                          >
                            Start
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* GROUP BATTLE SECTION */}
        <section className="w-1/2 px-6">
          <div className="container mx-auto">
            <div className="bg-white rounded-[4rem] min-h-[70vh] shadow-xl border border-gray-100 relative overflow-hidden p-12 flex flex-col items-center justify-center text-center">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full -mr-64 -mt-64 blur-3xl" />

              <div className="w-24 h-24 bg-indigo-50 text-[#6266F0] rounded-[2rem] flex items-center justify-center mb-8">
                <Users size={48} />
              </div>

              <h2 className="text-4xl font-black text-[#232B36] mb-4 uppercase tracking-tighter">Squadron Battles</h2>
              <p className="max-w-md text-gray-400 font-medium text-lg leading-relaxed mb-12">
                Collaborate with your squad to dominate the arena. Group rankings and tournament access coming soon.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl text-left">
                {[
                  { label: "Active Squads", val: "840", icon: <Users size={16} /> },
                  { label: "Total Power", val: "12.4M", icon: <Zap size={16} /> },
                  { label: "Squad Rank", val: "#142", icon: <Trophy size={16} /> }
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      {item.icon} <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <div className="text-xl font-black text-[#232B36]">{item.val}</div>
                  </div>
                ))}
              </div>

              <div className="mt-16 p-8 bg-indigo-600 rounded-[3rem] text-white w-full max-w-xl relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h3 className="text-xl font-black mb-2">Assemble Your Squadron</h3>
                <p className="text-indigo-100 text-sm opacity-80 mb-6">Create or join a squad to compete in group-only tournaments.</p>
                <button className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Browse Squads</button>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Matchmaking overlay */}
      {isSearching && (
        <div className="fixed inset-0 bg-[#232B36]/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
              <div className="h-full bg-[#6266F0] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            <button onClick={onCancelMatchmaking} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>

            <div className="mb-10">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Establishing Secure Connection</p>
              <h3 className="text-3xl font-black text-[#232B36] mb-2">{progress < 100 ? 'Searching...' : 'Ready'}</h3>
              <p className="text-gray-400 font-medium text-xs">Battle Mode: {matchType}</p>
            </div>

            <div className="flex items-center justify-center gap-10 mb-12">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-2 border-indigo-100 p-1 mb-4 shadow-xl overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="me" />
                  ) : (
                    <div className="w-full h-full bg-indigo-50 rounded-full flex items-center justify-center font-black text-[#6266F0]">
                      {user?.username?.substring(0, 2).toUpperCase() || "ME"}
                    </div>
                  )}
                </div>
                <span className="font-black text-sm text-[#232B36]">You</span>
              </div>

              <div className="text-3xl font-black text-gray-200">VS</div>

              <div className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-full border-2 ${opponent ? 'border-amber-100 shadow-xl shadow-amber-100' : 'border-dashed border-gray-200'} p-1 mb-4 transition-all duration-500 overflow-hidden`}>
                  {opponent ? (
                    opponent.avatar ? (
                      <img src={opponent.avatar} className="w-full h-full rounded-full object-cover" alt="opp" />
                    ) : (
                      <div className="w-full h-full bg-amber-50 rounded-full flex items-center justify-center font-black text-amber-500">
                        {opponent.username?.substring(0, 2).toUpperCase() || "OP"}
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center">
                      <Loader2 size={32} className="text-gray-200 animate-spin" />
                    </div>
                  )}
                </div>
                <span className={`font-black text-sm ${opponent ? 'text-[#232B36]' : 'text-gray-400'}`}>{opponent?.username || "???"}</span>
              </div>
            </div>

            {progress >= 100 ? (
              <button
                onClick={onBeginBattle}
                className="w-full py-5 bg-[#232B36] text-white rounded-2xl font-black hover:bg-[#6266F0] transition-all shadow-2xl shadow-indigo-100 animate-in zoom-in-95 duration-300"
              >
                ENTER ARENA
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{progress}% Synchronized</div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const CrownIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);
