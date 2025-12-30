  "use client";
  import React, { useState } from "react";
  import SideBar from "../components/profile/sideBar";
  import Leaderboard from "../components/profile/leaderboard";
  import Pro from "../components/profile/pro";
  import Friends from "../components/profile/friends";
  import Group from "../components/profile/group";
  import NavBar from "../components/navBar";

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
      <div>
        <NavBar />
        <div className="min-h-screen bg-[#F7F8FD]">
          {/* Sidebar */}

          <div className="absolute left-0 top-16 w-64 h-full z-10">
            <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          {/* Main Content */}
          <div className="ml-64 min-h-screen overflow-y-auto    h-screen">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }
