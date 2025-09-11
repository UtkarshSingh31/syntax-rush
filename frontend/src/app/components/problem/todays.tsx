import React from "react";

export default function Todays() {
  return (
    <div className="flex flex-col   p-3 bg-white border-4 border-[#EBEBF3] rounded-3xl mt-10 ">
      <div className="flex flex-col">
        <span className="text-black text-xl md:text-xl font-bold">
          Today’s question
        </span>
        <div className="flex">
          <div className="flex items-center mt-2">
            <span className="text-xs text-gray-400 mr-2">250.</span>
            <span className="text-sm md:text-base text-black font-medium mr-3">
              Fruits into baskets
            </span>
            <span className="text-xs text-green-500 font-semibold bg-green-100 rounded px-2 py-0.5">
              easy
            </span>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="bg-[#6266F0] hover:bg-[#555aec] text-white font-semibold text-sm rounded-full w-fit px-2 py-1  shadow transition mt-4 ">
            start solving
          </button>
        </div>
      </div>
    </div>
  );
}
