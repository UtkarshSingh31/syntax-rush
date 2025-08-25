import React from "react";

const previousBattles = [
  { name: "player-6", time: "12min", result: "win" },
  { name: "player-6", time: "10min", result: "lose" },
  { name: "player-6", time: "12min", result: "win" },
  { name: "player-6", time: "12min", result: "win" },
  { name: "player-6", time: "12min", result: "win" },
  { name: "player-6", time: "12min", result: "lose" },
  { name: "player-6", time: "12min", result: "lose" },
  { name: "player-6", time: "12min", result: "win" },
  { name: "player-6", time: "12min", result: "win" },
  { name: "player-6", time: "12min", result: "win" },
  { name: "player-6", time: "12min", result: "win" },
  { name: "player-6", time: "12min", result: "win" },
];

const soloRanking = [
  { name: "player-1", score: "300xp", battles: "3 battle", icon: "🥇" },
  { name: "player-2", score: "300xp", battles: "3 battle", icon: "🥈" },
  { name: "player-3", score: "300xp", battles: "3 battle", icon: "🥉" },
  { name: "player-4", score: "300xp", battles: "3 battle", icon: "" },
  { name: "player-5", score: "300xp", battles: "3 battle", icon: "" },
  { name: "player-6", score: "300xp", battles: "3 battle", icon: "" },
  { name: "player-7", score: "300xp", battles: "3 battle", icon: "" },
];

export default function Lb() {
  return (
    <div className="w-full min-h- flex  justify-center bg-[#f7f8fa] py-8">
      <div className="flex h-fit flex-col md:flex-row gap-8 w-full max-w-[50vw]">
        <div className="flex-1 bg-white rounded-2xl shadow p-6">
          <h2 className="text-center text-gray-700 font-semibold mb-6">
            Previous battles
          </h2>
          <ul>
            {previousBattles.map((b, i) => (
              <li
                key={i}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-200" />
                  <span className="text-gray-700">{b.name}</span>
                </div>
                <span className="text-gray-400 text-sm">{b.time}</span>
                <span
                  className={
                    b.result === "win"
                      ? "text-green-500 font-medium text-sm"
                      : "text-red-400 font-medium text-sm"
                  }
                >
                  {b.result}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 h-fit bg-white rounded-2xl shadow p-6">
          <h2 className="text-center text-gray-700 font-semibold mb-6 flex items-center justify-center gap-2">
            <span className="text-lg">✖️</span> Solo Battle Ranking
          </h2>
          <ul>
            {soloRanking.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-right ${
                      i < 3 ? "text-yellow-400 font-bold" : "text-gray-400"
                    }`}
                  >
                    {i + 1}.
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gray-200" />
                  <span
                    className={`${
                      i < 3
                        ? "text-yellow-400 font-semibold"
                        : "text-gray-700 font-medium"
                    }`}
                  >
                    {r.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {r.score && r.battles
                      ? `${r.score} ${r.battles}`
                      : r.battles}
                  </span>
                </div>
                <span className="text-xl">{r.icon}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
