"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

const difficultyColor = {
  Easy: "text-green-600 bg-green-100",
  Medium: "text-yellow-600 bg-yellow-100",
  Hard: "text-red-600 bg-red-100",
};

export default function Ques({ battleId }: { battleId?: string | null }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get("/problem/all-problems");
        setQuestions(response.data.data.problems);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);
  return (
    <div className="h-full px-4 sm:px-8  mb-10">
      <div className="flex items-center mb-4 gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search questions"
            className="w-full md:w-[30vw] pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white focus:outline-none text-sm sm:text-base"
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
        <button className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100">
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
              strokeWidth="3"
            />
            <path
              d="M11.292 14.9571C10.5844 16.371 8.59486 16.4464 7.78588 15.09L1.22667 4.092C0.44878 2.7877 1.35307 1.12466 2.87147 1.06712L15.1681 0.601187C16.6865 0.543652 17.7098 2.13365 17.0293 3.49321L11.292 14.9571Z"
              fill="#D9D9D9"
            />
          </svg>
        </button>
        <button className="p-2 w-10 sm:w-12 rounded-full text-gray-500 bg-white border border-gray-300 hover:bg-gray-100">
          ☰
        </button>
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-3 rounded-2xl overflow-y-auto h-[70vh] sm:h-[80vh]">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No questions found.</div>
        ) : (
          questions.map((q, idx) => (
            <Link href={`/problem/${q._id}${battleId ? `?battleId=${battleId}` : ''}`} key={q._id}>
              <div
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white px-4 sm:px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1 text-gray-800 font-medium text-sm sm:text-base">
                  {idx + 1}. {q.title}
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                  <div className="text-gray-500 text-sm">
                    {q.stats?.successRate || 0}%
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold capitalize ${difficultyColor[q.difficulty as keyof typeof difficultyColor]
                      }`}
                  >
                    {q.difficulty}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
