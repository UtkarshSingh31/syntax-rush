"use client";
import React, { useState } from "react";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function Cal() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array(daysInMonth)
      .fill(0)
      .map((_, i) => i + 1),
  ];

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  return (
    <div className="flex flex-col  bg-white border-4 border-[#EBEBF3] rounded-3xl mt-5  px-2 ">
      <div className="flex items-center justify-between px-5 pt-5">
        <button
          className="text-xl text-gray-500 font-light hover:text-gray-700"
          onClick={prevMonth}
        >
          &lt;
        </button>
        <span className="text-xl font-semibold text-gray-700">
          {months[currentMonth]}
        </span>
        <button
          className="text-xl text-gray-500 font-light hover:text-gray-700"
          onClick={nextMonth}
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0 ">
        {days.map((d) => (
          <div key={d} className="text-center text-gray-400  text-sm pt-4">
            {d}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 p-1 ">
        {calendarDays.map((day, i) =>
          day ? (
            <div
              key={i}
              className="flex items-center justify-center h-9   text-gray-600 text-sm rounded-md hover:scale-105 hover:bg-gray-100 cursor-pointer"
            >
              {day}
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>
    </div>
  );
}
