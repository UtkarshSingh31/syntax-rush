"use client";
import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  ChevronDown, 
  Check, 
  ChevronUp, 
  Play,
  User
} from "lucide-react";

export default function ProblemStPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("C++");
  const [showTestResult, setShowTestResult] = useState(true);

  const languages = ["C++", "Python", "Java", "JavaScript"];

  const codeTemplate = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`;

  return (
    <div className="h-screen flex flex-col bg-[#F7F8FD] overflow-hidden">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 52 57"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.77761 46.4769C6.09812 46.4769 5.46719 46.8698 5.10949 47.5153L1.76846 53.5442C0.959318 55.0046 1.90012 56.8904 3.43755 56.8904H34.8932C35.5973 56.8904 36.2483 56.4687 36.5977 55.7857L41.3577 46.4769H6.77761Z"
                fill="#6266F0"
              />
              <path
                d="M29.3507 21.7963C28.9923 22.4827 28.9937 23.3322 29.3555 24.0165L41.2354 46.4769H49.9669C51.4747 46.4765 52.4188 44.6552 51.6685 43.1938L35.065 10.8497L29.3507 21.7963Z"
                fill="#282828"
              />
              <path
                d="M1.96515 10.9615C0.466978 10.9617 -0.478683 12.762 0.252002 14.2233L16.4014 46.5106L21.3013 35.564C21.5883 34.9223 21.5762 34.1643 21.2687 33.5344L10.2492 10.9615H1.96515Z"
                fill="#282828"
              />
              <path
                d="M16.7209 0C16.0029 0 15.342 0.438091 14.9981 1.14218L10.2036 10.9615H45.6949C46.4129 10.9615 47.0738 10.5234 47.4177 9.81936L50.6293 3.24243C51.3425 1.78167 50.3958 0.000326679 48.9066 0H16.7209Z"
                fill="#6266F0"
              />
            </svg>
          </div>
          
          <span className="text-gray-800 font-semibold text-base">Problem List</span>
          
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <Maximize2 size={18} className="text-gray-600" />
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
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">91. Decode Ways</h1>

            {/* Problem Description */}
            <div className="space-y-4 text-gray-700">
              <p>
                You have intercepted a secret message encoded as a string of numbers. The message is decoded via the following mapping:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div>"1" → 'A'</div>
                <div>"2" → 'B'</div>
                <div>"25" → 'Y'</div>
                <div>"26" → 'Z'</div>
              </div>

              <p>
                For example, the string "11106" can be decoded into "AAJF" with the grouping (1 1 10 6), but it cannot be decoded as "06" because "06" is not a valid code. The grouping (1 11 06) is invalid because "06" cannot be mapped into 'F' since "6" is different from "06".
              </p>

              <p>
                Note that some strings might be impossible to decode. For instance, "06" cannot be decoded into a letter because it doesn't map to any valid character.
              </p>

              <p>
                Given a string <code className="bg-gray-100 px-1 rounded">s</code> containing only digits, return <strong>the number of ways to decode it</strong>.
              </p>

              {/* Constraints */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Constraints:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><code className="bg-gray-100 px-1 rounded">1 &lt;= s.length &lt;= 100</code></li>
                  <li><code className="bg-gray-100 px-1 rounded">s</code> contains only digits and may contain leading zeros.</li>
                </ul>
              </div>

              {/* Examples */}
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Example 1:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2"><strong>Input:</strong> <code className="bg-gray-100 px-1 rounded">s = "12"</code></div>
                    <div className="mb-2"><strong>Output:</strong> <code className="bg-gray-100 px-1 rounded">2</code></div>
                    <div><strong>Explanation:</strong> "12" could be decoded as "AB" (1 2) or "L" (12).</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Example 2:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2"><strong>Input:</strong> <code className="bg-gray-100 px-1 rounded">s = "226"</code></div>
                    <div className="mb-2"><strong>Output:</strong> <code className="bg-gray-100 px-1 rounded">3</code></div>
                    <div><strong>Explanation:</strong> "226" could be decoded as "BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 bg-white flex flex-col">
          {/* Code Editor Header */}
          <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-900">Code</span>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded px-4 py-1.5 pr-8 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6266F0]"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-auto bg-[#282c34] p-4">
            <pre className="text-sm font-mono">
              <code className="text-gray-300">
                {codeTemplate.split('\n').map((line, idx) => (
                  <div key={idx} className="flex">
                    <span className="text-gray-500 mr-4 select-none w-8 text-right">{idx + 1}</span>
                    <span className="flex-1">
                      {line.split(' ').map((word, wordIdx) => {
                        const keywords = ['class', 'public:', 'vector', 'int', 'Solution'];
                        const isKeyword = keywords.includes(word.replace(/[^a-zA-Z]/g, ''));
                        return (
                          <span
                            key={wordIdx}
                            className={isKeyword ? 'text-[#61afef]' : word.includes('(') || word.includes(')') || word.includes('&') || word.includes('{') || word.includes('}') ? 'text-[#e06c75]' : 'text-gray-300'}
                          >
                            {word}{' '}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-green-600" />
            <span className="font-medium text-gray-700">Testcase</span>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium text-gray-700">Test Result</span>
          <button
            onClick={() => setShowTestResult(!showTestResult)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ChevronUp size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-200 rounded">
            <Play size={18} className="text-gray-600" />
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition-colors">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

