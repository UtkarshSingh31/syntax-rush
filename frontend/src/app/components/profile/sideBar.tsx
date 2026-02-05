"use client";
import React from "react";
import { FiEdit2, FiUser, FiAward, FiUsers, FiLogOut } from "react-icons/fi";

interface SideBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
}

import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SideBar({ activeTab, setActiveTab, user }: SideBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="bg-[#F0F1F6] flex flex-col h-full w-full border-r border-gray-100">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div
          className="mb-8 text-gray-400 cursor-pointer hover:text-[#6266F0] transition-colors flex items-center gap-2 group"
          onClick={() => (window.location.href = "/problem")}
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 font-bold text-xs group-hover:bg-indigo-50 transition-all">
            ✕
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Exit Profile</span>
        </div>

        <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200/50">
          <div className="relative group p-1 bg-white rounded-full shadow-xl shadow-indigo-100/50 border border-gray-100">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={user?.profilePicture || "/profile.png"}
                alt="Profile"
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
          </div>
          <div className="mt-4 text-center px-2">
            <h2 className="text-[#232B36] text-lg font-black tracking-tighter truncate w-full max-w-[180px]">
              {user?.fullname || "User"}
            </h2>
            <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-0.5">@{user?.username || "username"}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 w-full">
          {[
            { id: "profile", label: "Identity", icon: FiUser },
            { id: "leaderboard", label: "Rankings", icon: FiAward },
            { id: "group", label: "Squads", icon: FiUsers },
            { id: "friends", label: "Network", icon: FiUsers },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-4 px-5 py-3.5 transition-all group
                    ${activeTab === tab.id
                  ? "bg-white text-[#6266F0] rounded-xl shadow-sm border border-gray-50"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 rounded-xl"
                }
                `}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} className={activeTab === tab.id ? "text-[#6266F0]" : "text-gray-300 group-hover:text-gray-400"} />
              <span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Fixed Footer */}
      <div className="p-6 border-t border-gray-200/50 bg-[#F0F1F6]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-4 group text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all w-full"
        >
          <FiLogOut size={16} className="text-gray-300 group-hover:text-red-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">logout</span>
        </button>
      </div>
    </div>
  );
}
