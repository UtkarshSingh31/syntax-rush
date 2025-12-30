"use client";
import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import { BarChart3 } from "lucide-react";

export default function ContestPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 11,
    minutes: 21,
    seconds: 55,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      <NavBar />

      <section className="h-[50vh] bg-[#282c34] flex flex-col py-10 text-center  px-4">
        <p className="text-gray-300 text-sm md:text-base mb-4 md:mb-6">
          Next Contest starts in:
        </p>
        <div className="flex  text-center  gap-2 md:gap-4 flex-wrap">
          <span className="text-white text-xl md:text-2xl lg:text-3xl font-bold">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
          <span className="text-[#ffc107] text-xl md:text-2xl lg:text-3xl font-bold">
            {timeLeft.seconds}s
          </span>
        </div>
      </section>

      {/* Bottom Half + Rest of Page (Scrolls) */}
      <section className="flex-1 bg-white flex flex-col justify-center px-4 py-10 md:py-14">
        <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 items-center">
            {/* Left Content Block */}
            <div className="bg-[#e0e0e0] rounded-3xl md:rounded-[2rem] w-full h-48 md:h-60"></div>

            {/* Right Content Block */}
            <div className="bg-[#e0e0e0] rounded-3xl md:rounded-[2rem] w-full h-48 md:h-60"></div>
          </div>

          {/* Divider Bar */}
          <div className="bg-[#e0e0e0] h-3 md:h-4 rounded-full my-6 w-full"></div>

          {/* Contest Ranking Section */}
          <div className="flex items-center justify-center pb-4">
            <button className="flex items-center gap-2 md:gap-3 text-[#333] hover:text-[#1F2937] transition-colors">
              <BarChart3 size={20} className="md:w-6 md:h-6" />
              <span className="text-base md:text-lg font-semibold">
                Contest Ranking
              </span>
            </button>
          </div>

          {/* Extra filler to test scrolling */}
          <div className="h-[100vh] flex items-center justify-center text-gray-400">
            Scroll area (still white background)
          </div>
        </div>
      </section>
    </div>
  );
}
