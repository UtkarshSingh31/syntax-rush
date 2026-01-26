"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { socket } from "@/socket";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ChevronDown,
  Check,
  Play,
  User
} from "lucide-react";

export default function ProblemStPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const battleId = searchParams.get("battleId");

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const languages = ["javascript", "python", "java", "cpp"];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUser(res.data.data.user);
      } catch (err) {
        console.error("Auth failed", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/problem/${id}`);
        const prob = response.data.data.problem;
        setProblem(prob);
        setCode("// Enter your code here\n");
      } catch (error) {
        console.error("Failed to fetch problem:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProblem();
  }, [id]);

  useEffect(() => {
    if (battleId && user) {
      socket.connect();
      socket.emit("join_battle", { battleId, user });
    }
  }, [battleId, user]);

  const handleSubmit = async () => {
    if (!code) return;
    setSubmitting(true);
    try {
      const endpoint = battleId ? `/battles/${battleId}/submit` : "/submissions/submit";
      const response = await api.post(endpoint, {
        problemId: id,
        code,
        language: selectedLanguage
      });

      const submission = response.data.data.submission;
      alert(`Submission Status: ${submission.status}`);

      if (battleId && submission.status === "accepted") {
        socket.emit("update_progress", { battleId, userId: user._id, progress: 100 });
        socket.emit("battle_submission", { battleId, userId: user._id, submission });
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || "Something went wrong"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F7F8FD] overflow-hidden">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 52 57" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.77761 46.4769C6.09812 46.4769 5.46719 46.8698 5.10949 47.5153L1.76846 53.5442C0.959318 55.0046 1.90012 56.8904 3.43755 56.8904H34.8932C35.5973 56.8904 36.2483 56.4687 36.5977 55.7857L41.3577 46.4769H6.77761Z" fill="#6266F0" />
              <path d="M29.3507 21.7963C28.9923 22.4827 28.9937 23.3322 29.3555 24.0165L41.2354 46.4769H49.9669C51.4747 46.4765 52.4188 44.6552 51.6685 43.1938L35.065 10.8497L29.3507 21.7963Z" fill="#282828" />
              <path d="M1.96515 10.9615C0.466978 10.9617 -0.478683 12.762 0.252002 14.2233L16.4014 46.5106L21.3013 35.564C21.5883 34.9223 21.5762 34.1643 21.2687 33.5344L10.2492 10.9615H1.96515Z" fill="#282828" />
              <path d="M16.7209 0C16.0029 0 15.342 0.438091 14.9981 1.14218L10.2036 10.9615H45.6949C46.4129 10.9615 47.0738 10.5234 47.4177 9.81936L50.6293 3.24243C51.3425 1.78167 50.3958 0.000326679 48.9066 0H16.7209Z" fill="#6266F0" />
            </svg>
          </div>
          <span className="text-gray-800 font-semibold text-base">Problem Detail</span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded" onClick={() => window.history.back()}>
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <User size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Two Columns */}
      <div className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">Loading problem...</div>
        ) : !problem ? (
          <div className="flex-1 flex items-center justify-center text-red-500">Problem not found.</div>
        ) : (
          <>
            <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">{problem.problemNumber}. {problem.title}</h1>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${problem.difficulty === 'Easy' ? 'text-green-600 bg-green-100' :
                  problem.difficulty === 'Medium' ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'
                  }`}>
                  {problem.difficulty}
                </span>
                {problem.tags?.map((tag: any) => (
                  <span key={tag.name} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="space-y-4 text-gray-700 whitespace-pre-wrap">
                {problem.description}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Input Format:</h3>
                  <p className="text-sm bg-gray-50 p-2 rounded">{problem.inputFormat}</p>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Output Format:</h3>
                  <p className="text-sm bg-gray-50 p-2 rounded">{problem.outputFormat}</p>
                </div>
                {problem.testCases && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Test Cases (Visible):</h3>
                    {problem.testCases.slice(0, 2).map((tc: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <div className="mb-2"><strong>Input:</strong> <code className="bg-gray-100 px-1 rounded">{tc.input}</code></div>
                        <div><strong>Output:</strong> <code className="bg-gray-100 px-1 rounded">{tc.output}</code></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-1/2 bg-white flex flex-col">
              <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Code</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium text-gray-700 focus:outline-none"
                >
                  {languages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 p-4 font-mono text-sm bg-[#282c34] text-gray-300 outline-none resize-none"
                spellCheck={false}
              />
            </div>
          </>
        )}
      </div>

      <div className="bg-gray-100 border-t border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-green-600" />
            <span className="font-medium text-gray-700">Ready</span>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !problem}
          className={`${submitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2 rounded font-semibold transition-colors`}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
