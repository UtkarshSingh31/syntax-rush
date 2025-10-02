"use client";
import React, { useState } from "react";
import SideBar from "../components/profile/sideBar";
import Leaderboard from "../components/profile/leaderboard";
import Pro from "../components/profile/pro";
import Friends from "../components/profile/friends";
import Group from "../components/profile/group";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Pro />;
      case "leaderboard":
        return <Leaderboard />;
      case "group":
        return <Group />;
      case "friends":
        return <Friends />;
      default:
        return <Friends />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FD]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full z-10">
        <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {renderContent()}
      </div>
    </div>
  );
}
