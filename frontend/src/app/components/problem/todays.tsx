import React from "react";

export default function Todays() {
  return (
    <div className="flex items-start bg-white border-4 border-[#EBEBF3] rounded-3xl h-full mt-10 mr-10 p-5 ">
      <div className="flex flex-col">
        <span className="text-black text-2xl font-bold ">Today’s question</span>
        <div className="flex items-center mt-2">
          <span className="text-xs text-gray-400 mr-2">250.</span>
          <span className="text-sm text-black font-medium mr-3">
            Fruits into baskets
          </span>
          <span className="text-xs text-green-500 font-semibold bg-green-100 rounded px-2 py-0.5">
            easy
          </span>
        </div>
      </div>
      <button className="bg-[#D4B200] hover:bg-[#D4A300] text-white font-semibold text-sm rounded-full px-4 mt-16 ml-14 py-1 shadow transition">
        start solving
      </button>
    </div>
  );
}
