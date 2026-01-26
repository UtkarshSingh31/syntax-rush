"use client";
import React, { useMemo, useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, UserPlus, Users, MessageCircle, Swords, Check, X, Shield, Plus, LogOut, ArrowUpCircle, Edit3 } from "lucide-react";

export default function Group() {
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [tempHandle, setTempHandle] = useState("");
  const [newGroup, setNewGroup] = useState({ name: "", username: "", isPublic: true });

  const fetchMyGroups = async () => {
    try {
      const res = await api.get("/group/my-groups");
      const fetchedGroups = res.data.data.groups;
      setGroups(fetchedGroups);
      if (fetchedGroups.length > 0) {
        if (!activeGroup || !fetchedGroups.find((g: any) => g._id === activeGroup._id)) {
          setActiveGroup(fetchedGroups[0]);
        }
      }
      fetchSuggestions(); // Always fetch fresh suggestions
    } catch (err) {
      console.error("Failed to fetch groups");
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await api.get("/group/suggestions");
      setSuggestions(res.data.data.suggestions);
    } catch (err) {
      console.error("Failed to fetch suggestions");
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await api.get("/social/friends");
      setFriends(res.data.data.friends);
    } catch (err) {
      console.error("Failed to fetch friends");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setCurrentUser(res.data.data.user);
    } catch (err) {
      console.error("Failed to fetch profile");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchMyGroups(), fetchFriends(), fetchProfile()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeGroup) {
      const fetchRequests = async () => {
        try {
          const res = await api.get(`/group/${activeGroup._id}/requests`);
          setRequests(res.data.data.requests);
        } catch (err) { /* Not owner likely */ }
      };
      fetchRequests();
      setTempHandle(activeGroup.username || "");
    }
  }, [activeGroup]);

  const handleSearch = async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/group/search?query=${q}`);
      setSearchResults(res.data.data.groups);
    } catch (err) { console.error(err); }
  };

  const handleJoin = async (id: string) => {
    try {
      await api.post(`/group/${id}/join`);
      alert("Request sent or joined successfully!");
      fetchMyGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to join");
    }
  };

  const handleLeave = async () => {
    if (!activeGroup) return;
    if (!confirm("Are you sure you want to leave this group?")) return;
    try {
      await api.post(`/group/${activeGroup._id}/leave`);
      alert("Left group successfully");
      const remaining = groups.filter(g => g._id !== activeGroup._id);
      setGroups(remaining);
      setActiveGroup(remaining.length > 0 ? remaining[0] : null);
      fetchMyGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to leave");
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      await api.post(`/group/${activeGroup._id}/promote`, { userId });
      alert("Member promoted to co-admin!");
      const res = await api.get(`/group/${activeGroup._id}`);
      setActiveGroup(res.data.data.group);
    } catch (err: any) {
      alert(err.response?.data?.message || "Promotion failed");
    }
  };

  const handleUpdateHandle = async () => {
    if (!activeGroup) return;
    try {
      await api.patch(`/group/${activeGroup._id}`, { username: tempHandle });
      alert("Group handle updated!");
      setIsEditingHandle(false);
      const res = await api.get(`/group/${activeGroup._id}`);
      setActiveGroup(res.data.data.group);
      fetchMyGroups(); // Update handle in sidebar too
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update handle. It might be taken.");
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      await api.post("/social/request", { friendId });
      alert("Friend request sent!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Already friends or request pending");
    }
  };

  const handleRequest = async (userId: string, action: 'accept' | 'reject') => {
    try {
      await api.post(`/group/${activeGroup._id}/requests/handle`, { userId, action });
      setRequests(requests.filter(r => r.userId._id !== userId));
      const res = await api.get(`/group/${activeGroup._id}`);
      setActiveGroup(res.data.data.group);
    } catch (err) { alert("Action failed"); }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your squads...</div>;

  if (groups.length === 0 && !showCreate) {
    return (
      <div className="min-h-screen bg-[#F7F8FD] p-10 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white p-10 rounded-3xl shadow-xl mb-10">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Groups Yet</h2>
            <p className="text-gray-500 mb-8">Join an existing squad or create your own to dominate the leaderboards.</p>
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Find a group..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white shadow-2xl rounded-xl z-50 text-left border overflow-hidden">
                    {searchResults.map(g => (
                      <div key={g._id} className="p-3 flex items-center justify-between border-b last:border-0 hover:bg-gray-50 cursor-pointer">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{g.name}</p>
                          <p className="text-xs text-gray-400">{g.members?.length} members</p>
                        </div>
                        {groups.length === 0 && (
                          <button onClick={() => handleJoin(g._id)} className="text-xs font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors">Join</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setShowCreate(true)} className="w-full py-3 bg-[#232b36] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1a2029] transition-colors">
                <Plus size={18} /> Create New Group
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="text-left">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-4">Suggested Squads</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map(s => (
                  <div key={s._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800">{s.name}</h4>
                      <p className="text-xs text-gray-400">@{s.username || 'squad'} • {s.members?.length} Members</p>
                    </div>
                    {groups.length === 0 && (
                      <button onClick={() => handleJoin(s._id)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-indigo-100 transition-colors">Join</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showCreate) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center bg-[#F7F8FD]">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Start a Squad</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Group Name</label>
              <input
                placeholder="e.g. Code Warriors"
                className="w-full p-4 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                value={newGroup.name}
                onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Handle (unique)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  placeholder="codewarriors"
                  className="w-full p-4 pl-9 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newGroup.username}
                  onChange={e => setNewGroup({ ...newGroup, username: e.target.value })}
                />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                className="w-5 h-5 rounded text-indigo-600"
                checked={newGroup.isPublic}
                onChange={e => setNewGroup({ ...newGroup, isPublic: e.target.checked })}
              />
              <span className="text-sm font-medium">Public Group (Anyone can join)</span>
            </label>
            <div className="flex gap-4 mt-6">
              <button
                onClick={async () => {
                  if (!newGroup.name) return alert("Name is required");
                  try {
                    await api.post("/group/create", newGroup);
                    setShowCreate(false);
                    fetchMyGroups();
                  } catch (err: any) { alert(err.response?.data?.message || "Failed to create group"); }
                }}
                className="flex-1 py-4 bg-[#232b36] text-white rounded-xl font-bold hover:bg-[#1a2029] transition-colors"
              >
                Create
              </button>
              <button onClick={() => setShowCreate(false)} className="flex-1 py-4 border rounded-xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupOwnerId = activeGroup.owner?._id || activeGroup.owner;
  const isOwner = currentUser?._id === groupOwnerId;

  return (
    <div className="min-h-screen bg-[#F7F8FD] p-10">
      <div className="grid grid-cols-4 grid-rows-9 gap-6 min-h-[120vh]">
        {/* Header */}
        <div className="col-span-4 row-span-2 rounded-3xl shadow-lg bg-[#232b36] text-white p-10 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex items-center gap-10 relative z-10">
            <div className="w-28 h-28 bg-white/10 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border border-white/10">👥</div>
            <div>
              <h1 className="text-4xl font-bold mb-1">{activeGroup.name}</h1>
              {!isEditingHandle ? (
                <div className="flex items-center gap-3 mb-6">
                  <p className="text-white/60 tracking-wide font-mono text-sm">@{activeGroup.username || (isOwner ? "set-handle" : "squad")}</p>
                  {isOwner && (
                    <button onClick={() => setIsEditingHandle(true)} className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/30 hover:text-white">
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-6">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">@</span>
                    <input
                      autoFocus
                      value={tempHandle}
                      onChange={e => setTempHandle(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-7 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
                      onKeyDown={e => e.key === 'Enter' && handleUpdateHandle()}
                    />
                  </div>
                  <button onClick={handleUpdateHandle} className="p-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"><Check size={14} /></button>
                  <button onClick={() => setIsEditingHandle(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><X size={14} /></button>
                </div>
              )}
              <div className="flex gap-4">
                <span className="px-5 py-2 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider border border-white/5">{activeGroup.members?.length} Members</span>
                <span className="px-5 py-2 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider border border-white/5">{activeGroup.isPublic ? "Public" : "Private"}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleLeave} className="p-5 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition-all border border-red-500/10" title="Leave Group">
              <LogOut size={28} />
            </button>
            <button className="p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/5" title="Battle (Coming Soon)">
              <Swords size={28} />
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="col-span-2 row-span-5 bg-white rounded-3xl shadow-sm p-8 border border-gray-100 overflow-y-auto">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-gray-800"><Users size={22} className="text-indigo-600" /> Crew Roster</h3>
          <div className="space-y-4">
            {activeGroup.members?.map((m: any, i: number) => {
              const isOwnerMember = m.role === "owner";
              const isAdmin = m.role === "admin";
              const isFriend = friends.some(f => f.userId?._id === m.userId?._id);
              const isMe = currentUser?._id === m.userId?._id;

              return (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-5">
                    <img src={m.userId?.profilePicture || "/profile.png"} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="" />
                    <div>
                      <h4 className="font-bold text-gray-800">{m.userId?.fullname || "Loading..."}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-black tracking-widest ${isOwnerMember ? 'text-amber-500' : isAdmin ? 'text-indigo-400' : 'text-gray-300'}`}>
                          {m.role}
                        </span>
                        <p className="text-[10px] text-gray-400">@{m.userId?.username}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* If I am owner and this is a member, show promote button */}
                    {isOwner && m.role === 'member' && (
                      <button onClick={() => handlePromote(m.userId._id)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-colors" title="Promote to Co-admin">
                        <ArrowUpCircle size={18} />
                      </button>
                    )}
                    {/* Friend Interaction */}
                    {!isMe && !isFriend && (
                      <button onClick={() => sendFriendRequest(m.userId._id)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Add Friend">
                        <UserPlus size={18} />
                      </button>
                    )}
                    {isFriend && !isMe && (
                      <span className="p-2 text-green-500 bg-green-50 rounded-lg text-[10px] font-black uppercase">Friend</span>
                    )}
                    {isOwnerMember && <Shield size={18} className="text-amber-500 fill-amber-500/20" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Requests (Owner only) */}
        {requests.length > 0 && (
          <div className="col-span-2 row-span-3 bg-indigo-50/50 rounded-3xl border border-indigo-100 p-8 shadow-inner">
            <h3 className="text-xl font-bold text-indigo-900 mb-8 flex items-center gap-3">Incoming Join Requests ({requests.length})</h3>
            <div className="space-y-4">
              {requests.map((r) => (
                <div key={r.userId._id} className="bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between border border-indigo-100/30">
                  <div className="flex items-center gap-4">
                    <img src={r.userId.profilePicture || "/profile.png"} className="w-10 h-10 rounded-full border-2 border-indigo-50" alt="" />
                    <span className="text-sm font-bold text-gray-800">{r.userId.fullname}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRequest(r.userId._id, 'accept')} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"><Check size={20} /></button>
                    <button onClick={() => handleRequest(r.userId._id, 'reject')} className="p-3 bg-white text-gray-400 rounded-xl border border-gray-100 hover:text-red-500 transition-all"><X size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Squad Selection */}
        <div className={`col-span-2 ${requests.length > 0 ? 'row-span-4' : 'row-span-7'} bg-white rounded-3xl shadow-sm p-8 border border-gray-100`}>
          <h3 className="text-xl font-bold mb-6 text-gray-800 text-center">Your Active Squad</h3>
          {groups.length > 0 ? (
            <div className="space-y-4">
              {groups.map(g => (
                <div
                  key={g._id}
                  className={`p-6 rounded-3xl transition-all border bg-[#232b36] text-white border-transparent shadow-2xl scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg block mb-1">{g.name}</span>
                      <span className={`text-xs text-white/50 font-bold uppercase tracking-widest`}>{g.members?.length} Members</span>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white/10`}>
                      <Users size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm">Join a group from suggestions to see it here.</p>
            </div>
          )}

          {/* Suggestions in Sidebar if few groups */}
          {groups.length > 0 && suggestions.length > 0 && (
            <div className="mt-10 pt-10 border-t border-gray-100">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">You might like</h4>
              <div className="space-y-3">
                {suggestions.map(s => (
                  <div key={s._id} className="flex items-center justify-between group">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{s.name}</p>
                      <p className="text-[10px] text-gray-400">{s.members?.length} members</p>
                    </div>
                    <button onClick={() => handleJoin(s._id)} className="text-[10px] font-black text-indigo-500 uppercase px-2 py-1 bg-indigo-50 rounded-md">Join</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
