"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import NavBar from "@/app/components/navBar";
import Prog from "@/app/components/problem/prog";
import Chat from "@/app/components/problem/chat";
import Ques from "@/app/components/problem/ques";

function ProblemContent() {
  const [showChat, setShowChat] = useState(true);
  const searchParams = useSearchParams();
  const battleId = searchParams.get("battleId");

  const handleShow = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FD]">
      <NavBar />

      <div className="hidden lg:grid grid-cols-12 gap-8 px-8 mt-4 min-h-[calc(100vh-120px)] relative">
        {/* Chat Sidebar */}
        <div
          className={`bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden transition-all duration-700 ease-in-out sticky top-24 ${showChat ? "col-span-3 opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none w-0"
            }`}
          style={{ height: "calc(100vh - 140px)" }}
        >
          <Chat />
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleShow}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-50 w-8 h-20 bg-[#232B36] text-white rounded-xl flex items-center justify-center hover:bg-[#6266F0] transition-all shadow-xl group"
          style={{
            left: showChat ? "calc(25% + 1rem)" : "1rem",
            transition: "left 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {showChat ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* Main Content */}
        <div
          className={`flex flex-col gap-8 transition-all duration-700 ease-in-out ${showChat ? "col-span-9" : "col-span-12 px-12"
            }`}
        >
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <Prog battleId={battleId} />
          </div>
          <div className="bg-white border border-gray-100 rounded-[3.5rem] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 mb-10">
            <Ques battleId={battleId} />
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden flex flex-col gap-6 p-4">
        <Prog battleId={battleId} />
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-2">
          <Ques battleId={battleId} />
        </div>
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm h-[50vh] overflow-hidden">
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default function Problem() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FD]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Arena...</p>
        </div>
      </div>
    }>
      <ProblemContent />
    </Suspense>
  );
}
