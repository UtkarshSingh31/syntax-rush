"use client";
import React, { useState, useEffect } from "react";
import SideBar from "../components/profile/sideBar";
import Leaderboard from "../components/profile/leaderboard";
import Pro from "../components/profile/pro";
import Friends from "../components/profile/friends";
import Group from "../components/profile/group";
import NavBar from "../components/navBar";
import api from "@/lib/api";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/profile");
      setUser(res.data.data.user);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const renderContent = () => {
    if (loading) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;
    if (!user) return <div className="p-10 text-center text-red-500">Please login to view profile.</div>;

    switch (activeTab) {
      case "profile":
        return <Pro user={user} onUserUpdate={(updatedUser: any) => setUser(updatedUser)} />;
      case "leaderboard":
        return <Leaderboard />;
      case "group":
        return <Group />;
      case "friends":
        return <Friends />;
      default:
        return <Pro user={user} onUserUpdate={(updatedUser: any) => setUser(updatedUser)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FD]">
      <NavBar />
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className="w-64 fixed left-0 top-0 h-screen border-r bg-[#F0F1F6] z-10">
          <SideBar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
