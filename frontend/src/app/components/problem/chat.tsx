"use client";
import React, { useRef, useState, useEffect } from "react";

type Message = {
  user: "me" | "other";
  text: string;
};

const initialMessages: Message[] = [
  { user: "other", text: "Hello ji ki haal chaal!" },
  { user: "other", text: "balle balle" },
  {
    user: "me",
    text: "balle balle ji balle balle  sab badhiya ",
  },
  { user: "other", text: "theek ji theek" },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { user: "me", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          user: "other",
          text: "chal chal chal chal ",
        },
      ]);
    }, 900);
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col bg-white border-4 border-[#EBEBF3] rounded-3xl h-full mt-10 mr-10 pb-3 ">
      <h1 className="text-center bg-slate-400/10 p-2 rounded-t-xl  text-gray-700 font-semibold mb-4 ">
        Global Chat
      </h1>
      <div
        className="flex-1 flex flex-col gap-1 overflow-y-auto pb-4 px-2"
        ref={chatContainerRef}
      >
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const showAvatar =
            msg.user === "other" && (idx === 0 || prev.user !== "other");

          if (msg.user === "me") {
            return (
              <div
                key={idx}
                className="flex flex-row-reverse items-start gap-3"
              >
                <div className="flex flex-col gap-1 items-end w-full">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 m-2 rounded-2xl max-w-xs break-words">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  {showAvatar ? (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      A
                    </div>
                  ) : (
                    <div className="w-6 h-6" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl max-w-xs break-words">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          }
        })}
        {/* <div ref={messagesEndRef} /> */}
      </div>

      <form
        className="flex items-center mt-4 bg-gray-50 rounded-full mx-3 px-3 py-2 border border-gray-200"
        onSubmit={handleSend}
      >
        <input
          type="text"
          className="flex-1 bg-transparent outline-none px-2  text-gray-700"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="ml-2 text-gray-400 disabled:opacity-40"
          disabled={!input.trim()}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
