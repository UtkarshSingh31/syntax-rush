import React, { useState } from "react";

const soloPreview = [
  { name: "player-1", score: 980 },
  { name: "player-2", score: 920 },
  { name: "player-3", score: 860 },
  { name: "player-4", score: 820 },
  { name: "player-5", score: 780 },
];

const groupPreview = [
  { team: "Alpha Coders", score: 2150 },
  { team: "Bug Smashers", score: 1990 },
  { team: "Runtime Terrors", score: 1880 },
  { team: "Null Pointers", score: 1760 },
];

export default function pro() {
  const [about, setAbout] = useState(
    "Passionate about algorithms and competitive coding. I enjoy speed-typing battles and building tools for developers. Always learning, always shipping."
  );
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState(about);
  return (
    <div>
      <div className="grid grid-cols-4 grid-rows-9 gap-4 min-h-[150vh] m-10 ml-10 ">
      
        <div className="col-span-2 row-span-3 h-full w-full rounded-xl bg-[#232b36] text-white p-6 flex gap-6">
          <img src="/profile.png" alt="profile" className="w-28 h-28 rounded-full object-cover" />
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold">Player Name</h2>
              <p className="text-sm text-gray-300">@username</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-gray-300">XP</p>
                <p className="text-lg font-semibold">2,450</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-gray-300">Battles</p>
                <p className="text-lg font-semibold">124</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-gray-300">Win rate</p>
                <p className="text-lg font-semibold">62%</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {["JavaScript", "TypeScript", "C++", "Python"].map((t) => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/10">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Account overview */}
        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-3 p-6">
          <h3 className="text-gray-800 font-semibold mb-4">Account Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-4">
              <p className="text-xs text-gray-500">Current Rank</p>
              <p className="text-lg font-semibold text-gray-800">#12</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
              <p className="text-xs text-gray-500">Solo Top Score</p>
              <p className="text-lg font-semibold text-gray-800">980</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
              <p className="text-xs text-gray-500">Group Top Score</p>
              <p className="text-lg font-semibold text-gray-800">2150</p>
            </div>
          </div>
        </div>

        {/* Skills / Languages */}
        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-1 row-start-6 p-6">
          <h3 className="text-gray-800 font-semibold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {["Arrays", "Graphs", "DP", "Greedy", "Backtracking", "Strings", "Math"].map((s) => (
              <span key={s} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">{s}</span>
            ))}
          </div>
        </div>

        {/* Progress & Streak */}
        <div className="row-span-4 h-full w-full bg-white rounded-xl shadow col-start-3 row-start-5 p-6">
          <h3 className="text-gray-800 font-semibold mb-2">Progress & Streak</h3>
          <p className="text-xs text-gray-500 mb-6">Your last 7 days of activity</p>
          <div className="flex items-end gap-3 h-40">
            {[35, 60, 80, 45, 90, 70, 95].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-8 rounded-md bg-gradient-to-t from-[#232b36] to-gray-400" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-gray-500">{["M","T","W","T","F","S","S"][i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-xs text-gray-500">Current Streak</p>
              <p className="text-lg font-semibold text-gray-800">7 days</p>
            </div>
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-xs text-gray-500">Weekly XP</p>
              <p className="text-lg font-semibold text-gray-800">+420</p>
            </div>
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-xs text-gray-500">Best Streak</p>
              <p className="text-lg font-semibold text-gray-800">18 days</p>
            </div>
          </div>
        </div>

        {/* Badges & Trophies */}
        <div className="row-span-4 h-full w-full bg-white rounded-xl shadow col-start-4 row-start-5 p-6">
          <h3 className="text-gray-800 font-semibold mb-2">Badges & Trophies</h3>
          <p className="text-xs text-gray-500 mb-4">Keep collecting to level up your profile</p>
          <div className="grid grid-cols-2 gap-3">
            {["🏆 Champion", "⚡ Speedster", "🧠 Strategist", "🎯 Accuracy", "🔥 Streaker", "🤝 Team Player"].map((b, i) => (
              <div key={i} className="rounded-xl p-4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm text-gray-800">
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-1 row-start-8 p-6">
          <h3 className="text-gray-800 font-semibold mb-4">Achievements</h3>
          <div className="flex gap-3 flex-wrap">
            {["100 Wins", "Weekly Streak 7", "Fast Typer", "Problem Solver"].map((a, i) => (
              <div key={i} className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-700">{a}</div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-1 row-start-4 p-6">
          <h3 className="text-gray-800 font-semibold mb-4">Recent Activity</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Won a solo battle in 6:21 • +40 xp</li>
            <li>Joined team "Alpha Coders" • +10 xp</li>
            <li>Completed daily challenge • +20 xp</li>
          </ul>
        </div>

        {/* About / bio */}
        <div className="col-span-2 row-span-2 h-full w-full bg-white rounded-xl shadow col-start-3 row-start-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold ">About</h3>
            {!isEditingAbout && (
              <button
                className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => {
                  setAboutDraft(about);
                  setIsEditingAbout(true);
                }}
              >
                Edit
              </button>
            )}
          </div>
          {!isEditingAbout && (
            <p className="text-sm text-gray-700 overflow-y-auto  leading-6">{about}</p>
          )}
          {isEditingAbout && (
            <div className="space-y-3">
              <textarea
                value={aboutDraft}
                onChange={(e) => setAboutDraft(e.target.value)}
                rows={5}
                className="w-full rounded border border-gray-200 p-3 text-sm"
              />
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-[#232b36] text-white text-xs"
                  onClick={() => {
                    setAbout(aboutDraft);
                    setIsEditingAbout(false);
                  }}
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 rounded border text-xs"
                  onClick={() => setIsEditingAbout(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
