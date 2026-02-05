"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Edit3,
  Camera,
  MapPin,
  GraduationCap,
  Trophy,
  Swords,
  Zap,
  Mail,
  Shield,
  Calendar,
  Star,
  Activity,
  Award,
  Hash,
  Globe,
  User as UserIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface ProProps {
  user: any;
  onUserUpdate: (user: any) => void;
}

const StatBox = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex flex-col gap-2 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-2xl w-fit ${color}`}>
      <Icon size={20} />
    </div>
    <div className="mt-2">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xl font-black text-[#232B36] tracking-tight">{value}</p>
    </div>
  </div>
);

const RankCard = ({ label, current, highest, icon: Icon, color }: { label: string, current: any, highest: any, icon: any, color: string }) => (
  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 ${color}`} />
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-xl text-white ${color}`}>
          <Icon size={18} />
        </div>
        <h3 className="text-gray-800 font-black text-xs uppercase tracking-widest">{label} Rank</h3>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-5xl font-black text-[#232B36] tracking-tighter">
          #{current === Infinity || current === null ? "N/A" : current}
        </span>
        <div className="mb-2">
          <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Peak</p>
          <p className="text-xs font-black text-[#6266F0]">#{highest === Infinity || highest === null ? "N/A" : highest}</p>
        </div>
      </div>
    </div>
  </div>
);

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
      alert("Failed to update bio");
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
      alert("Failed to update identity info");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="p-10 text-center text-gray-500">No user data available.</div>;

  const formatDate = (date: any) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 pb-20 space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-[#232B36] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full -mr-48 -mt-48 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-[80px]" />

          <div className="relative flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] border-4 border-white/5 p-1.5 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl">
                <img
                  src={
                    profileDraft.profilePicture instanceof File
                      ? URL.createObjectURL(profileDraft.profilePicture)
                      : (profileDraft.profilePicture || user.profilePicture || "/profile.png")
                  }
                  alt="Profile"
                  className="w-full h-full rounded-[2.2rem] object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              {isEditingProfile && (
                <label htmlFor="pfp-upload" className="absolute -bottom-2 -right-2 p-3 bg-white text-[#232B36] rounded-2xl shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                  <Camera size={20} />
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

            <div className="flex-1 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
                <div className="text-center md:text-left">
                  {isEditingProfile ? (
                    <input
                      value={profileDraft.fullname}
                      onChange={(e) => setProfileDraft({ ...profileDraft, fullname: e.target.value })}
                      className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-3xl font-black outline-none focus:ring-4 focus:ring-indigo-500/30 w-full mb-2"
                    />
                  ) : (
                    <h1 className="text-4xl font-black tracking-tighter mb-1">{user.fullname}</h1>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <span className="text-indigo-400 font-bold text-sm tracking-wide">@{user.username}</span>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">{user.position}</span>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {user.isActive ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      {user.isActive ? 'Active' : 'Restricted'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                  className="px-8 py-3 bg-white text-[#232B36] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-xl active:scale-95"
                  disabled={saving}
                >
                  {isEditingProfile ? (saving ? "Encrypting..." : "Update Protocol") : "Edit Protocol"}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 font-bold">Points</p>
                  <p className="text-2xl font-black tracking-tight">{user.performanceStats?.totalPoints || 0}</p>
                </div>
                <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 font-bold">Problems</p>
                  <p className="text-2xl font-black tracking-tight">{user.performanceStats?.problemSolved || 0}</p>
                </div>
                <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2 font-bold">Accuracy</p>
                  <p className="text-2xl font-black tracking-tight">{user.performanceStats?.overAllWinRate || 0}%</p>
                </div>
                <div className="bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2 font-bold">Friends</p>
                  <p className="text-2xl font-black tracking-tight">{user.userFriendship?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* League Card */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Award className="text-amber-500 mb-4" size={48} />
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 font-bold">Current Tier</h3>
          <p className="text-3xl font-black text-[#232B36] uppercase tracking-tighter mb-4">{user.performanceStats?.currentLeague || "Unknown"}</p>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-2/3" />
          </div>
          <div className="mt-6 flex flex-col items-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Highest Reached</p>
            <p className="text-sm font-black text-indigo-600 uppercase italic tracking-tighter">{user.performanceStats?.highestLeague || "Bronze"}</p>
          </div>
        </div>
      </div>

      {/* Rankings Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <RankCard
          label="Global"
          current={user.performanceStats?.currentGlobalRank}
          highest={user.performanceStats?.HighestGlobalRank}
          icon={Globe}
          color="bg-indigo-600"
        />
        <RankCard
          label="Country"
          current={user.performanceStats?.currentcountryRank}
          highest={user.performanceStats?.HighestCountryRank}
          icon={MapPin}
          color="bg-emerald-600"
        />
        <RankCard
          label="College"
          current={user.performanceStats?.currentCollegeRank}
          highest={user.performanceStats?.HighestCollegeRank}
          icon={GraduationCap}
          color="bg-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Columns - Detailed Stats */}
        <div className="lg:col-span-8 space-y-10">
          {/* Battle Stats Breakdown */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-10">
              <Swords className="text-indigo-600" size={24} />
              <h3 className="text-xl font-black text-[#232B36] uppercase tracking-tight">Battle Stats</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatBox icon={Zap} label="Points" value={user.performanceStats?.battlePoints || 0} color="bg-indigo-50 text-indigo-600" />
              <StatBox icon={Activity} label="Participated" value={user.performanceStats?.battleParticipated || 0} color="bg-gray-50 text-gray-600" />
              <StatBox icon={Trophy} label="Victories" value={user.performanceStats?.battleWon || 0} color="bg-emerald-50 text-emerald-600" />
              <StatBox icon={AlertCircle} label="Defeats" value={user.performanceStats?.battleLost || 0} color="bg-rose-50 text-rose-600" />
            </div>
          </div>

          {/* Contest Stats Breakdown */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-10">
              <Star className="text-amber-500" size={24} />
              <h3 className="text-xl font-black text-[#232B36] uppercase tracking-tight">Contest Stats</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatBox icon={Zap} label="Contest Points" value={user.performanceStats?.contestPoints || 0} color="bg-amber-50 text-amber-600" />
              <StatBox icon={Activity} label="Participation" value={user.performanceStats?.contestsParticipated || 0} color="bg-blue-50 text-blue-600" />
              <StatBox icon={Trophy} label="Rank-1 Finishes" value={user.performanceStats?.contestsWon || 0} color="bg-purple-50 text-purple-600" />
            </div>
          </div>

          {/* Identity Info */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-10">
              <UserIcon className="text-indigo-600" size={24} />
              <h3 className="text-xl font-black text-[#232B36] uppercase tracking-tight">Member Identity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><Mail size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Verified Channel</p>
                    <p className="text-sm font-bold text-gray-700">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><GraduationCap size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Base of Operations</p>
                    {isEditingProfile ? (
                      <input
                        value={profileDraft.college}
                        onChange={(e) => setProfileDraft({ ...profileDraft, college: e.target.value })}
                        className="bg-gray-50 border-b-2 border-indigo-100 outline-none font-bold text-sm w-full py-1"
                      />
                    ) : (
                      <p className="text-sm font-bold text-gray-700">{user.college || "Unassigned"}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><MapPin size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Native Latitude</p>
                    {isEditingProfile ? (
                      <input
                        value={profileDraft.country}
                        onChange={(e) => setProfileDraft({ ...profileDraft, country: e.target.value })}
                        className="bg-gray-50 border-b-2 border-indigo-100 outline-none font-bold text-sm w-full py-1"
                      />
                    ) : (
                      <p className="text-sm font-bold text-gray-700">{user.country || "Earth"}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><Calendar size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Arena Enlistment</p>
                    <p className="text-sm font-bold text-gray-700">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Bio, Skills & Timeline */}
        <div className="lg:col-span-4 space-y-10">
          {/* Timeline Tracking */}
          <div className="bg-[#232B36] rounded-[3rem] p-10 text-white border border-gray-800 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="text-emerald-400" size={24} />
              <h3 className="text-lg font-black uppercase tracking-tighter">Vital Timeline</h3>
            </div>
            <div className="space-y-8">
              <div className="relative pl-6 border-l-2 border-gray-700">
                <div className="absolute top-0 left-0 -ml-[9px] w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Battle Engagement</p>
                <p className="text-xs font-bold">{formatDate(user.performanceStats?.lastBattleAt)}</p>
              </div>
              <div className="relative pl-6 border-l-2 border-gray-700">
                <div className="absolute top-0 left-0 -ml-[9px] w-4 h-4 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/20" />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Tournament Ascent</p>
                <p className="text-xs font-bold">{formatDate(user.performanceStats?.lastContestAt)}</p>
              </div>
            </div>
          </div>

          {/* Personal Bio */}
          <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-[#232B36] uppercase tracking-tighter">Persona Override</h3>
              {!isEditingAbout && (
                <button
                  onClick={() => setIsEditingAbout(true)}
                  className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                >
                  <Edit3 size={18} />
                </button>
              )}
            </div>
            {isEditingAbout ? (
              <div className="space-y-4">
                <textarea
                  value={aboutDraft}
                  onChange={(e) => setAboutDraft(e.target.value)}
                  className="w-full rounded-2xl border-2 border-indigo-50 p-6 focus:border-[#6266F0] outline-none min-h-[180px] text-sm font-medium leading-relaxed transition-all"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditingAbout(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Abort</button>
                  <button onClick={handleSaveAbout} className="px-8 py-2.5 rounded-xl bg-[#6266F0] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:-translate-y-0.5 transition-all" disabled={saving}>Confirm Bio</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 leading-relaxed text-sm font-medium">
                {user.about || "No story broadcasted to this sector yet. Override manually to update coordinates."}
              </p>
            )}
          </div>

          {/* Expertise Pillars */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-[#232B36] uppercase tracking-tighter mb-8 italic">Skill Vector Analysis</h3>
            <div className="flex flex-wrap gap-2.5">
              {(user.skills && user.skills.length > 0 ? user.skills : ["Standard Operating Procedural"]).map((skill: string) => (
                <div key={skill} className="px-5 py-2.5 bg-indigo-50/50 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-indigo-100/50 hover:bg-indigo-600 hover:text-white transition-all cursor-default">
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
