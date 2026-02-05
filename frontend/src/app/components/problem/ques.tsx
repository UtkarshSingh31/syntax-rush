"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Inbox, ArrowUpRight } from "lucide-react";
import api from "@/lib/api";

const difficultyColor = {
  Easy: "text-green-600 bg-green-100",
  Medium: "text-yellow-600 bg-yellow-100",
  Hard: "text-red-600 bg-red-100",
};

export default function Ques({ battleId }: { battleId?: string | null }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get("/problem/all-problems");
        setQuestions(response.data.data.problems);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);
  return (
    <div className="flex flex-col gap-6 h-full p-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
        <div>
          <h3 className="text-2xl font-black text-[#232B36]">Problems</h3>
          <p className="text-gray-400 text-sm font-medium">Select a challenge and start coding.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px]">
            <input
              type="text"
              placeholder="Search mysteries..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 outline-none transition-all text-sm font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#6266F0] hover:bg-indigo-50 transition-all shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Fetching Arena Data...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <Inbox size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">No challenges found at this coordinate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {questions.map((q, idx) => (
              <Link href={`/problem/${q._id}${battleId ? `?battleId=${battleId}` : ''}`} key={q._id}>
                <div
                  className="group flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-xs text-gray-400 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#232B36] group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{q.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{q.category || 'General'}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{q.submissions?.length || 0} Attempts</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="hidden sm:block text-right">
                      <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Success</p>
                      <span className="text-xs font-black text-[#232B36]">{q.stats?.successRate || 0}%</span>
                    </div>

                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                      {q.difficulty}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#232B36] group-hover:text-white group-hover:rotate-45 transition-all">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
