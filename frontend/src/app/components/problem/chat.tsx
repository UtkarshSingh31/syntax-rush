"use client";
import React, { useRef, useState, useEffect } from "react";
import api from "@/lib/api";

type Message = {
  _id?: string;
  userId: string;
  username: string;
  message: string;
  createdAt?: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const response = await api.get("/chat/global");
      // Reversing the order to ensure newest messages appear at the bottom
      const reversedData = [...response.data.data].reverse();
      setMessages(reversedData);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const tempInput = input;
    setInput("");

    try {
      await api.post("/chat/global", { message: tempInput });
      fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Are you logged in?");
    }
  }

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col bg-white h-full relative overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/10 shrink-0">
        <h3 className="text-lg font-black text-[#232B36] uppercase tracking-tighter">Global Relay</h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Atmosphere Channel</p>
      </div>

      <div
        className="flex-1 overflow-y-auto p-6 scroll-smooth flex flex-col gap-4"
        ref={chatContainerRef}
      >
        <div className="mt-auto flex flex-col gap-4">
          {messages.map((msg, idx) => {
            return (
              <div key={msg._id || idx} className="flex flex-col items-start gap-1 group animate-in slide-in-from-left-2 duration-300">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">{msg.username}</span>
                <div className="bg-gray-50 text-gray-600 px-5 py-3 rounded-2xl max-w-[90%] break-words text-sm font-medium border border-gray-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-all">
                  {msg.message}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-gray-50 shrink-0 bg-white">
        <form
          className="flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-100 transition-all"
          onSubmit={handleSend}
        >
          <input
            type="text"
            className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-700 font-medium placeholder:text-gray-300"
            placeholder="Broadcast a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[#232B36] text-white flex items-center justify-center hover:bg-[#6266F0] disabled:opacity-20 transition-all shadow-lg shadow-indigo-100"
            disabled={!input.trim()}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
