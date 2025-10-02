"use client";
import React from "react";
import { FiEdit2, FiUser, FiAward, FiUsers, FiLogOut } from "react-icons/fi";

interface SideBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SideBar({ activeTab, setActiveTab }: SideBarProps) {

  return (
    <div className="bg-[#1F2937] flex flex-col items-center justify-center pt-20 pl-10 text-center h-full w-full  ">
     
      <div
        className="fixed top-4 left-4 text-white cursor-pointer "
        onClick={() => (window.location.href = "/problem")}
      >
        <h1>X</h1>
      </div>
      <div className="flex flex-col items-center pr-10">
        <img
          src="/profile.png"
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border-4 border-gray-700"
        />
        <div className="flex items-center justify-center mt-4">
          <span className="text-white text-lg pl-2 text-center font-semibold">
            Your Name
          </span>
          <button className="ml-2 p-1 rounded-full hover:bg-gray-700 transition">
            <FiEdit2 className="text-gray-300" size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-10 mt-16 w-full ">
        <button
          className={`flex items-center gap-3 text-base transition px-1 py-4 
            ${
              activeTab === "profile"
                ? "bg-[#F7F8FD] text-[#1F2937] rounded-l-lg  rounded-r-none "
                : "text-gray-200 hover:text-white"
            }
          `}
          onClick={() => setActiveTab("profile")}
        >
          <FiUser size={20} />
          <span className="text-base">Profile</span>
        </button>
        <button
          className={`flex items-center gap-3 text-base transition px-1 py-4
            ${
              activeTab === "leaderboard"
                ? "bg-[#F7F8FD] text-[#1F2937] rounded-l-lg  rounded-r-none"
                : "text-gray-200 hover:text-white"
            }
          `}
          onClick={() => setActiveTab("leaderboard")}
        >
          <FiAward size={20} />
          <span className="text-base">Leaderboard</span>
        </button>
        <button
          className={`flex items-center gap-3 text-base transition px-1 py-4
            ${
              activeTab === "group"
                ? "bg-[#F7F8FD] text-[#1F2937] rounded-l-lg  rounded-r-none"
                : "text-gray-200 hover:text-white"
            }
          `}
          onClick={() => setActiveTab("group")}
        >
          <FiUsers size={20} />
          <span className="text-base">Group</span>
        </button>
        <button
          className={`flex items-center gap-3 text-base transition px-1 py-4
            ${
              activeTab === "friends"
                ? "bg-[#F7F8FD] text-[#1F2937] rounded-l-lg  transition-all  transform rounded-r-none"
                : "text-gray-200 hover:text-white"
            }
          `}
          onClick={() => setActiveTab("friends")}
        >
          <FiUsers size={20} />
          <span className="text-base">Friends</span>
        </button>
      </div>

      <div className="mt-auto w-full px-6 mb-4">
        <button className="flex items-start text-start gap-2 text-gray-500 hover:text-red-600  w-full">
          <FiLogOut size={20} />
          <span className="text-base">Log Out</span>
        </button>
      </div>
    </div>
  );
}
