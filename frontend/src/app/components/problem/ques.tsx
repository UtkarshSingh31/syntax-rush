import React from "react";

const questions = [
  { id: 1, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 2, title: "Three sum", percent: 69.2, difficulty: "hard" },
  { id: 3, title: "ZigZag converstion", percent: 53.2, difficulty: "medium" },
  { id: 4, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 5, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 6, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 7, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 1, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 2, title: "Three sum", percent: 69.2, difficulty: "hard" },
  { id: 3, title: "ZigZag converstion", percent: 53.2, difficulty: "medium" },
  { id: 4, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 5, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 6, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 7, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 1, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 2, title: "Three sum", percent: 69.2, difficulty: "hard" },
  { id: 3, title: "ZigZag converstion", percent: 53.2, difficulty: "medium" },
  { id: 4, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 5, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 6, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
  { id: 7, title: "Add two numbers", percent: 63.2, difficulty: "easy" },
];

const difficultyColor = {
  easy: "text-green-500 bg-green-100",
  medium: "text-yellow-500 bg-yellow-100",
  hard: "text-red-500 bg-red-100",
};

export default function Ques() {
  return (
    <div className=" h-full m-10 mt-16">
      <div className="flex items-center mb-4">
        <div className="relative flex-1 ">
          <input
            type="text"
            placeholder="Search questions"
            className="w-1/3 pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <button className="p-2 px-3 text-center  rounded-full bg-white  border border-[#cacacc] hover:bg-gray-100">
          <svg
            width="18"
            height="22"
            viewBox="0 0 18 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              y1="-1.5"
              x2="7.43697"
              y2="-1.5"
              transform="matrix(-0.0197559 -0.999805 -0.999805 0.0197559 8.18799 21.8141)"
              stroke="#D9D9D9"
              stroke-width="3"
            />
            <path
              d="M11.292 14.9571C10.5844 16.371 8.59486 16.4464 7.78588 15.09L1.22667 4.092C0.44878 2.7877 1.35307 1.12466 2.87147 1.06712L15.1681 0.601187C16.6865 0.543652 17.7098 2.13365 17.0293 3.49321L11.292 14.9571Z"
              fill="#D9D9D9"
            />
          </svg>
        </button>
        <button className="p-2 m-2 w-12 rounded-full text-[#b6b6b6] bg-white  border border-[#cacacc] hover:bg-gray-100">
          ☰
        </button>
      </div>
      <div className="flex-col gap-4 rounded-2xl  overflow-y-auto  h-[90vh]">
        {questions.map((q, idx) => (
          <div
            key={q.id + idx}
            className="flex justify-between bg-white m-2 rounded-full  items-center px-6 py-4 "
          >
            <div className="flex-1 text-gray-800 font-medium">
              {idx + 1}. {q.title}
            </div>
            <div className="w-20 text-right text-gray-500 ">{q.percent}%</div>
            <div
              className={`ml-6 mr-5 py-1 rounded-full text-sm font-semibold capitalize
    ${difficultyColor[q.difficulty as keyof typeof difficultyColor]}
    ${q.difficulty === "medium" ? "px-3 mr-0" : "px-3"}
  `}
            >
              {q.difficulty}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
