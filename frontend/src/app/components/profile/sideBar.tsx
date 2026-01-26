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
    <div className="bg-[#F0F1F6] flex flex-col pt-20 pb-10 px-8 h-full w-full border-r border-gray-100">
      <div
        className="fixed top-24 left-6 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors z-50"
        onClick={() => (window.location.href = "/problem")}
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 font-bold text-sm">
          ✕
        </div>
      </div>

      <div className="flex flex-col items-center mb-12">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full p-1 bg-white shadow-md border border-gray-100">
            <img
              src={user?.profilePicture || "/profile.png"}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

        </div>
        <div className="mt-4 text-center">
          <h2 className="text-[#232B36] text-xl font-bold tracking-tight">
            {user?.fullname || "User"}
          </h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">@{user?.username || "username"}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 w-full">
        <button
          className={`flex items-center gap-4 px-6 py-4 text-sm font-bold transition-all
            ${activeTab === "profile"
              ? "bg-white text-[#6266F0] rounded-2xl shadow-sm border border-gray-50"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 rounded-2xl"
            }
          `}
          onClick={() => setActiveTab("profile")}
        >
          <FiUser size={18} />
          <span>Profile</span>
        </button>
        <button
          className={`flex items-center gap-4 px-6 py-4 text-sm font-bold transition-all
            ${activeTab === "leaderboard"
              ? "bg-white text-[#6266F0] rounded-2xl shadow-sm border border-gray-50"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 rounded-2xl"
            }
          `}
          onClick={() => setActiveTab("leaderboard")}
        >
          <FiAward size={18} />
          <span>Leaderboard</span>
        </button>
        <button
          className={`flex items-center gap-4 px-6 py-4 text-sm font-bold transition-all
            ${activeTab === "group"
              ? "bg-white text-[#6266F0] rounded-2xl shadow-sm border border-gray-50"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 rounded-2xl"
            }
          `}
          onClick={() => setActiveTab("group")}
        >
          <FiUsers size={18} />
          <span>Group</span>
        </button>
        <button
          className={`flex items-center gap-4 px-6 py-4 text-sm font-bold transition-all
            ${activeTab === "friends"
              ? "bg-white text-[#6266F0] rounded-2xl shadow-sm border border-gray-50"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 rounded-2xl"
            }
          `}
          onClick={() => setActiveTab("friends")}
        >
          <FiUsers size={18} />
          <span>Friends</span>
        </button>
      </nav>

      <div className="mt-auto pt-10 border-t border-gray-200/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all w-full"
        >
          <FiLogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
