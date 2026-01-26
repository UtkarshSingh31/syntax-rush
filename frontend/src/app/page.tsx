"use client";
import React from "react";
import NavBar from "./components/navBar";
import Link from "next/link";
import { Swords, Trophy, Users, Zap, ArrowRight, Shield, Star, Crown } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F8FD]">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full -mr-64 -mt-64 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full -ml-48 -mb-48 blur-3xl opacity-50" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-black uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap size={16} className="fill-indigo-600" /> Season 1 is Live
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-[#232B36] tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            CODE. BATTLE.<br />
            <span className="text-[#6266F0]">RANK UP.</span>
          </h1>

          <p className="max-w-xl mx-auto text-gray-500 text-lg md:text-xl font-medium mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            Join the ultimate competitive arena for developers. Solve problems, form squadrons, and climb the global leaderboards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            <Link href="/problem" className="px-10 py-5 bg-[#6266F0] text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-200 hover:scale-105 transition-all flex items-center gap-3 group">
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/leaderboard" className="px-10 py-5 bg-white text-[#232B36] border border-gray-100 rounded-[2rem] font-black text-lg hover:bg-gray-50 transition-all shadow-sm">
              View Rankings
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white rounded-[4rem] mx-4 shadow-sm border border-gray-50 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group p-8 rounded-3xl hover:bg-indigo-50/50 transition-all">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6266F0] mb-8 group-hover:scale-110 group-hover:bg-[#6266F0] group-hover:text-white transition-all">
                <Swords size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#232B36] mb-4">Epic Battles</h3>
              <p className="text-gray-500 leading-relaxed font-medium">Real-time competitive coding battles. Challenge friends or find random opponents to test your speed.</p>
            </div>

            <div className="group p-8 rounded-3xl hover:bg-indigo-50/50 transition-all">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#232B36] mb-4">Squadron System</h3>
              <p className="text-gray-500 leading-relaxed font-medium">Form elite squads with your peers. Collaborate, share knowledge, and dominate as a single cohesive unit.</p>
            </div>

            <div className="group p-8 rounded-3xl hover:bg-indigo-50/50 transition-all">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Trophy size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#232B36] mb-4">Global Rank</h3>
              <p className="text-gray-500 leading-relaxed font-medium">Climb from Bronze to Master. Earn points for every victory and see where you stand on the world stage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-[#232B36] rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl" />
            <div className="relative z-10 max-w-lg">
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Ready to prove your coding prowess?</h2>
              <p className="text-gray-400 font-medium text-lg leading-relaxed">Join thousands of developers competing every day. The arena is waiting for its next champion.</p>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-6 w-full md:w-auto">
              {[
                { label: "Solutions", val: "500K+", icon: <Check className="text-emerald-500" size={16} /> },
                { label: "Active Battles", val: "2.4K", icon: <Swords className="text-indigo-400" size={16} /> },
                { label: "Top Rankers", val: "100+", icon: <Crown className="text-amber-500" size={16} /> },
                { label: "Countries", val: "50+", icon: <Star className="text-blue-400" size={16} /> }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-2 text-white/50">{stat.icon} <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span></div>
                  <div className="text-2xl font-black">{stat.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6266F0] rounded-lg flex items-center justify-center text-white font-black text-xl italic">A</div>
            <span className="text-[#232B36] font-black tracking-tighter text-xl uppercase">Antigravity Arena</span>
          </div>
          <div className="text-gray-400 text-sm font-medium">
            © 2026 Antigravity Arena. All rights reserved.
          </div>
          <div className="flex gap-8 text-sm font-black text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-[#6266F0] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#6266F0] transition-colors">Discord</a>
            <a href="#" className="hover:text-[#6266F0] transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Check = ({ className, size }: { className?: string, size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
