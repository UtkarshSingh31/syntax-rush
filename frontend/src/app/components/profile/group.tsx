import React, { useMemo, useState } from "react";

type Member = { name: string; role: "Leader" | "Member" };

export default function Group() {
  const [hasGroup, setHasGroup] = useState(true);
  const [isLeader, setIsLeader] = useState(true);

  // Editable group info (leader only)
  const [groupName, setGroupName] = useState("Alpha Coders");
  const [groupBio, setGroupBio] = useState("We code fast, learn faster, and help each other level up.");
  const [iconEmoji, setIconEmoji] = useState("👥");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingIcon, setIsEditingIcon] = useState(false);

  const members: Member[] = useMemo(
    () => [
      { name: "player-1", role: "Leader" },
      { name: "player-2", role: "Member" },
      { name: "player-3", role: "Member" },
      { name: "player-4", role: "Member" },
      { name: "player-5", role: "Member" },
    ],
    []
  );

  const pendingRequests = ["devfox", "coderbee", "nightowl"]; // leader view only
  const achievements = ["🏆 Weekend Champions", "⚡ Fastest Solve", "🤝 Mentor Month", "📈 10-Week Streak"];
  const [announcements, setAnnouncements] = useState<string[]>([
    "Team battle scheduled for Friday 7pm.",
    "Welcome new member: @devfox.",
    "Remember to complete daily challenges.",
  ]);
  const [isEditingAnnouncements, setIsEditingAnnouncements] = useState(false);
  const [announcementsDraft, setAnnouncementsDraft] = useState<string>(announcements.join("\n"));

  if (!hasGroup) {
    return (
      <div className="min-h-screen bg-[#F7F8FD] p-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-4 grid-rows-9 gap-4 min-h-[120vh]">
          {/* Discover / Join or Create */}
          <div className="col-span-4 row-span-3 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Join or Create a Group</h2>
            <p className="text-sm text-gray-500 mb-4">Find your squad or start one. Collaborate, compete, and grow together.</p>
            <div className="flex gap-3 mb-6">
              <input placeholder="Search groups" className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300" />
              <button className="px-4 py-2 rounded-lg bg-[#232b36] text-white">Search</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Alpha Coders", "Bug Smashers", "Runtime Terrors"].map((g, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-4 w-64">
                  <div className="text-sm font-semibold text-gray-800">{g}</div>
                  <div className="text-xs text-gray-500 mb-3">5 members • active</div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm">Request</button>
                    <button className="px-3 py-1 rounded-md bg-white border text-gray-700 text-sm">View</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 rounded-lg bg-[#232b36] text-white" onClick={() => setHasGroup(true)}>Create Group</button>
              <button className="px-4 py-2 rounded-lg bg-white border">Learn More</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FD] p-10">
      <div className="grid grid-cols-4 grid-rows-9 gap-4 min-h-[150vh]">
        {/* Header */}
        <div className="col-span-4 row-span-2 rounded-2xl shadow bg-[#232b36] text-white">
          <div className="flex items-center gap-6 p-6">
            <div className="relative w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
              {!isEditingIcon && <span>{iconEmoji}</span>}
              {isLeader && !isEditingIcon && (
                <button
                  className="absolute -bottom-2 right-0 px-2 py-1 text-xs rounded-md bg-white/10 border border-white/20"
                  onClick={() => setIsEditingIcon(true)}
                >
                  Edit
                </button>
              )}
              {isLeader && isEditingIcon && (
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <input
                    value={iconEmoji}
                    onChange={(e) => setIconEmoji(e.target.value)}
                    className="w-12 text-center rounded bg-white/90 text-[#232b36]"
                  />
                  <button className="text-xs px-2 py-1 bg-white text-[#232b36] rounded" onClick={() => setIsEditingIcon(false)}>
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1">
              {!isEditingName && <h2 className="text-xl font-semibold text-white">{groupName}</h2>}
              {isLeader && !isEditingName && (
                <button className="mt-1 text-xs px-2 py-1 rounded bg-white/10 border border-white/20" onClick={() => setIsEditingName(true)}>
                  Edit name
                </button>
              )}
              {isLeader && isEditingName && (
                <div className="flex items-center gap-2">
                  <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="text-sm rounded bg-white/90 text-[#232b36] px-2 py-1"
                  />
                  <button className="text-xs px-2 py-1 bg-white text-[#232b36] rounded" onClick={() => setIsEditingName(false)}>
                    Save
                  </button>
                </div>
              )}
            <div className="mt-1 flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">{members.length} Members</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">2,150 Score</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">Active</span>
            </div>
            {isLeader ? (
              <textarea
                value={groupBio}
                onChange={(e) => setGroupBio(e.target.value)}
                className="mt-3 w-full rounded-lg bg-white/10 p-3 text-sm outline-none text-white placeholder:text-white/70"
                rows={3}
              />
            ) : (
              <p className="mt-3 text-sm text-gray-200 max-w-3xl">{groupBio}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 rounded-lg bg-white text-[#232b36]">Invite</button>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20">Share</button>
              <button className="px-4 py-2 rounded-lg bg-red-500/90 text-white" onClick={() => setHasGroup(false)}>Leave Group</button>
            </div>
            </div>
          </div>
        </div>

        {/* Members list */}
        <div className="col-span-2 row-span-5 bg-white rounded-xl shadow col-start-1 row-start-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold">Members</h3>
            <input placeholder="Search members" className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          </div>
          <ul className="space-y-3">
            {members.map((m, i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <span className="text-sm text-gray-800">{m.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{m.role}</span>
                  {isLeader && m.role !== "Leader" && (
                    <button className="text-xs text-red-600">Remove</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Announcements */}
        <div className="col-span-2 row-span-2 bg-white rounded-2xl shadow col-start-3 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-800 font-semibold">Announcements</h3>
            {isLeader && (
              <button
                className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => {
                  setAnnouncementsDraft(announcements.join("\n"));
                  setIsEditingAnnouncements(true);
                }}
              >
                Edit
              </button>
            )}
          </div>
          {!isEditingAnnouncements && (
            <ul className="space-y-2 text-sm text-gray-700">
              {announcements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
          {isEditingAnnouncements && (
            <div className="space-y-2">
              <textarea
                value={announcementsDraft}
                onChange={(e) => setAnnouncementsDraft(e.target.value)}
                rows={4}
                className="w-full rounded border border-gray-200 p-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-[#232b36] text-white text-xs"
                  onClick={() => {
                    setAnnouncements(announcementsDraft.split(/\n+/).filter(Boolean));
                    setIsEditingAnnouncements(false);
                  }}
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 rounded border text-xs"
                  onClick={() => setIsEditingAnnouncements(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Requests (leader only) */}
        <div className="col-span-2 row-span-2 bg-white rounded-2xl shadow col-start-3 row-start-5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold">Join Requests</h3>
            {!isLeader && <span className="text-xs text-gray-500">Only visible to leaders</span>}
          </div>
          {isLeader ? (
            <ul className="space-y-3">
              {pendingRequests.map((u, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-200" />
                    <span className="text-sm text-gray-800">@{u}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-md bg-[#232b36] text-white text-xs">Accept</button>
                    <button className="px-3 py-1 rounded-md bg-white border text-gray-700 text-xs">Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No access</p>
          )}
        </div>

        <div className="col-span-2 row-span-4 bg-white rounded-2xl shadow col-start-3 row-start-7 p-6">
          <h3 className="text-gray-800 font-semibold mb-2">War Log</h3>
          <p className="text-xs text-gray-500 mb-4">Recent battles</p>
          <div className="grid grid-cols-2 gap-3">
            {["Win • 3-1", "Win • 5-4", "Lose • 2-3", "Win • 4-0", "Win • 6-5", "Win • 7-6"].map((r, i) => (
              <div key={i} className="rounded-xl p-4 bg-gray-50 border border-gray-200 text-sm text-gray-800 flex items-center justify-between">
                <span>{r}</span>
                <span className="text-xs text-gray-500">+{(i+1)*10} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="col-span-2 row-span-4 bg-white rounded-2xl shadow col-start-4 row-start-7 p-6">
          <h3 className="text-gray-800 font-semibold mb-2">Group Achievements</h3>
          <p className="text-xs text-gray-500 mb-4">Milestones earned together</p>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a, i) => (
              <div key={i} className="rounded-xl p-4 bg-gray-50 text-sm text-gray-800 border border-gray-200">
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


