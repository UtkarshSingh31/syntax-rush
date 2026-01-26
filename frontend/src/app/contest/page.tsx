"use client";
import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import { Timer, Trophy, Users, Star, ArrowRight, Zap, Target, BookOpen, Crown } from "lucide-react";
import Link from "next/link";

export default function ContestPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 11,
    minutes: 21,
    seconds: 55,
  });

  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FD] font-sans">
      <NavBar />

      {/* Hero Countdown Section */}
      <section className="relative pt-20 pb-20 bg-[#232B36] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6266F0]/20 rounded-full -mr-64 -mt-64 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full -ml-48 -mb-48 blur-3xl" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-12">
            <Zap size={14} className="fill-indigo-300" /> Grand Championship 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            NEXT CLASH <span className="text-[#6266F0]">BEGINS IN</span>
          </h1>

          <div className="flex justify-center gap-4 md:gap-8 mb-16">
            {[
              { val: timeLeft.days, label: "Days" },
              { val: timeLeft.hours, label: "Hours" },
              { val: timeLeft.minutes, label: "Mins" },
              { val: timeLeft.seconds, label: "Secs", primary: true }
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-20 h-24 md:w-28 md:h-32 rounded-3xl flex items-center justify-center text-4xl md:text-6xl font-black mb-3 border backdrop-blur-xl ${unit.primary ? 'bg-[#6266F0] border-[#6266F0]/50 shadow-2xl shadow-[#6266F0]/40' : 'bg-white/5 border-white/10'}`}>
                  {String(unit.val).padStart(2, '0')}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{unit.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-10 py-4 bg-white text-[#232B36] rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-gray-100 transition-all">Register Now</button>
            <button className="px-10 py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-white/20 transition-all flex items-center gap-2">
              <BookOpen size={18} /> Rules & Prizes
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mx-auto px-6 -mt-12 relative z-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Contests List Sidebar/Main */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-indigo-100/50 border border-gray-100 flex items-center">
              {['upcoming', 'active', 'past'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${activeTab === tab ? 'bg-[#6266F0] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab} Contests
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-[#6266F0]/10 transition-colors" />

                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-[#6266F0] group-hover:bg-[#6266F0] group-hover:text-white transition-all">
                      <Target size={32} />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-[#232B36]">Starters Clash #{item + 10}</h3>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">Free Entry</span>
                      </div>
                      <p className="text-gray-500 font-medium leading-relaxed">Level up your basics with this focused problem set covering Strings and Arrays. Perfect for beginners and intermediate coders.</p>
                      <div className="flex flex-wrap gap-6 pt-2">
                        <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-wider"><Timer size={14} /> 2 Hours</div>
                        <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-wider"><Users size={14} /> 1.2K Joined</div>
                        <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-wider"><Trophy size={14} /> 500 Points</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <button className="px-8 py-4 bg-[#232B36] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1a2029] transition-all flex items-center justify-center gap-2">
                        Details <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking & Hall of Fame */}
          <div className="space-y-10">
            {/* Contest Rankings Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-[#232B36] flex items-center gap-3"><Crown size={20} className="text-amber-500" /> Hall of Fame</h3>
                <span className="text-[10px] font-black text-indigo-500 uppercase cursor-pointer">View All</span>
              </div>

              <div className="space-y-6">
                {[
                  { name: "CodeXMaster", rank: 1, points: "24.5k", avatar: "CX" },
                  { name: "BugHunter", rank: 2, points: "21.2k", avatar: "BH" },
                  { name: "Skyline_01", rank: 3, points: "19.8k", avatar: "SK" }
                ].map((user) => (
                  <div key={user.rank} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 -m-3 rounded-2xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${user.rank === 1 ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-[#6266F0]'}`}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#232B36]">{user.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">#{user.rank} Global Rank</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-[#6266F0]">{user.points}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Motivation Card */}
            <div className="bg-[#6266F0] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <Star className="text-white/20 fill-white/10 absolute bottom-4 right-4" size={64} />
              <h4 className="text-xl font-black mb-4 relative z-10">Want to host<br />your own?</h4>
              <p className="text-indigo-100 text-sm font-medium mb-6 relative z-10 opacity-80 leading-relaxed">Host custom contests for your squad or university using our advanced creator tools.</p>
              <button className="w-full py-4 bg-white text-[#6266F0] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all relative z-10">Create Contest</button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
