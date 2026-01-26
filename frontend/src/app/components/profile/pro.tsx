"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Edit3, Camera, MapPin, GraduationCap, Trophy, Swords, Zap } from "lucide-react";

interface ProProps {
  user: any;
  onUserUpdate: (user: any) => void;
}

export default function Pro({ user, onUserUpdate }: ProProps) {
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [aboutDraft, setAboutDraft] = useState(user?.about || "");
  const [profileDraft, setProfileDraft] = useState({
    fullname: user?.fullname || "",
    college: user?.college || "",
    country: user?.country || "",
    profilePicture: user?.profilePicture || ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAboutDraft(user?.about || "");
    setProfileDraft({
      fullname: user?.fullname || "",
      college: user?.college || "",
      country: user?.country || "",
      profilePicture: user?.profilePicture || ""
    });
  }, [user]);

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/auth/update-profile", { about: aboutDraft });
      onUserUpdate(res.data.data.user);
      setIsEditingAbout(false);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullname", profileDraft.fullname);
      formData.append("college", profileDraft.college);
      formData.append("country", profileDraft.country);

      if (profileDraft.profilePicture instanceof File) {
        formData.append("profilePicture", profileDraft.profilePicture);
      }

      const res = await api.patch("/auth/update-profile", formData);
      onUserUpdate(res.data.data.user);
      setIsEditingProfile(false);
    } catch (err) {
      alert("Failed to update profile info");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="p-10 text-center text-gray-500">No user data available.</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-[#6266F0] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />

          <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white/30 p-1 bg-white/10 backdrop-blur-sm overflow-hidden">
                <img
                  src={
                    profileDraft.profilePicture instanceof File
                      ? URL.createObjectURL(profileDraft.profilePicture)
                      : (profileDraft.profilePicture || user.profilePicture || "/profile.png")
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              {isEditingProfile && (
                <label htmlFor="pfp-upload" className="absolute bottom-0 right-0 p-2 bg-white text-[#6266F0] rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Camera size={18} />
                  <input
                    id="pfp-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setProfileDraft({ ...profileDraft, profilePicture: file });
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex-1 space-y-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  {isEditingProfile ? (
                    <input
                      value={profileDraft.fullname}
                      onChange={(e) => setProfileDraft({ ...profileDraft, fullname: e.target.value })}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-2xl font-bold outline-none focus:ring-2 focus:ring-white/50 w-full"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold tracking-tight">{user.fullname}</h1>
                  )}
                  <p className="text-indigo-100/80 font-medium">@{user.username}</p>
                </div>
                <button
                  onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-xl font-semibold transition-all"
                  disabled={saving}
                >
                  {isEditingProfile ? (saving ? "Saving..." : "Save Profile") : "Edit Profile"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2 text-indigo-100 text-xs font-medium mb-1 capitalize">
                    <Trophy size={14} /> Points
                  </div>
                  <div className="text-2xl font-bold uppercase">{user.performanceStats?.totalPoints || 0}</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2 text-indigo-100 text-xs font-medium mb-1 capitalize">
                    <Swords size={14} /> Battles
                  </div>
                  <div className="text-2xl font-bold uppercase">{user.performanceStats?.battleParticipated || 0}</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2 text-indigo-100 text-xs font-medium mb-1 capitalize">
                    <Zap size={14} /> Win Rate
                  </div>
                  <div className="text-2xl font-bold uppercase">{user.performanceStats?.overAllWinRate || 0}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-gray-800 font-bold text-lg mb-4">World Ranking</h3>
            <div className="flex items-center gap-6">
              <div className="text-5xl font-black text-[#6266F0] tracking-tighter">
                #{user.performanceStats?.currentGlobalRank || "N/A"}
              </div>
              <div className="text-gray-500 text-sm leading-tight uppercase font-bold">
                Global<br />Position
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Solved</p>
              <p className="text-lg font-bold text-gray-800">{user.performanceStats?.problemSolved || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">League</p>
              <p className="text-lg font-bold text-emerald-600 uppercase tracking-wide text-xs">{user.performanceStats?.currentLeague || "Bronze"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        {/* Education & Bio */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
                <GraduationCap className="text-[#6266F0]" size={20} />
                Identity & Location
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">College</span>
                {isEditingProfile ? (
                  <input
                    value={profileDraft.college}
                    onChange={(e) => setProfileDraft({ ...profileDraft, college: e.target.value })}
                    className="w-full border-b-2 border-indigo-100 focus:border-[#6266F0] outline-none py-2 font-semibold transition-all"
                  />
                ) : (
                  <p className="font-semibold text-gray-700">{user.college || "Not specified"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Country</span>
                {isEditingProfile ? (
                  <input
                    value={profileDraft.country}
                    onChange={(e) => setProfileDraft({ ...profileDraft, country: e.target.value })}
                    className="w-full border-b-2 border-indigo-100 focus:border-[#6266F0] outline-none py-2 font-semibold transition-all"
                  />
                ) : (
                  <p className="font-semibold text-gray-700">{user.country || "Not specified"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
                <Edit3 className="text-[#6266F0]" size={20} />
                Personal Story
              </h3>
              {!isEditingAbout && (
                <button
                  onClick={() => setIsEditingAbout(true)}
                  className="text-xs font-bold text-[#6266F0] hover:text-[#4d51bf] uppercase tracking-widest"
                >
                  Edit Bio
                </button>
              )}
            </div>
            {isEditingAbout ? (
              <div className="space-y-4">
                <textarea
                  value={aboutDraft}
                  onChange={(e) => setAboutDraft(e.target.value)}
                  className="w-full rounded-2xl border-2 border-indigo-50 p-4 focus:border-[#6266F0] outline-none min-h-[150px] transition-all"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditingAbout(false)} className="px-4 py-2 rounded-xl border font-bold text-xs">Cancel</button>
                  <button onClick={handleSaveAbout} className="px-6 py-2 rounded-xl bg-[#6266F0] text-white font-bold text-xs" disabled={saving}>Save Bio</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed font-medium">
                {user.about || "No story shared yet."}
              </p>
            )}
          </div>
        </div>

        {/* Skills sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-gray-800 font-bold text-lg mb-6">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {(user.skills && user.skills.length > 0 ? user.skills : ["Generalist"]).map((skill: string) => (
                <div key={skill} className="px-4 py-2 bg-indigo-50 text-[#6266F0] rounded-xl text-xs font-bold uppercase tracking-wider">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
