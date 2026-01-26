"use client";
import { useState } from "react";
import React from "react";
import NavBar from "@/app/components/navBar";
import Prog from "@/app/components/problem/prog";
import Cal from "@/app/components/problem/cal";
import Chat from "@/app/components/problem/chat";
import Ques from "@/app/components/problem/ques";
import Todays from "@/app/components/problem/todays";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProblemContent() {
  const [showChat, setShowChat] = useState(true);
  const [showQues, setShowQues] = useState(true);
  const searchParams = useSearchParams();
  const battleId = searchParams.get("battleId");

  const handleShow = () => {
    setShowChat(!showChat);
    setTimeout(() => setShowQues(!showQues), 200);
  };

  return (
    <div className="min-h-screen pb-10  ">
      <NavBar />

      <div className="hidden lg:grid grid-cols-5 grid-rows-3  gap-4 scale-y-[96%] origin-top ">
        <div className="row-span-1 col-start-5 row-start-1 mr-5">
          <Cal />
        </div>
        <div className="col-start-5 row-start-2 mr-5">
          <Todays />
        </div>

        <div
          className={` row-start-1 col-span-3 transition-all duration-700 ease-in-out ${showChat ? "ml-0" : "-ml-72"
            }`}
        >
          <Prog battleId={battleId} />
        </div>

        <div
          className={`row-span-4 row-start-2 col-span-3 transition-all duration-700 ease-in-out relative ${showChat ? " ml-0" : "lg:-ml-72 "
            }`}
        >
          <Ques battleId={battleId} />
        </div>

        <div
          className={`row-span-2 col-start-1 row-start-1  bg-gray-100  relative transform transition-transform duration-700 ease-in-out  ${showChat ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <Chat />

          <button
            onClick={() => handleShow()}
            className={`absolute top-1/2 right-1 translate-x-full -translate-y-1/2 bg-[#fcfcff] text-slate-500  px-1 py-2 rounded-r transition-colors duration-300 hover:bg-gray-100  ${showChat
              ? "border-r-2 border-y-2 border-[#EBEBF3]"
              : "border-r-2 border-y-2 border-[#EBEBF3]"
              }`}
          >
            {showChat ? "く" : "➦"}
          </button>
        </div>
      </div>

      <div className="lg:hidden md:hidden flex flex-col gap-6 p-4">
        <Prog battleId={battleId} />
        <Ques battleId={battleId} />
        <Cal />
        <Todays />
        <Chat />
      </div>

      <div className="lg:hidden  sm:hidden md:flex flex-col gap-6 ">
        <Prog battleId={battleId} />
        <Ques battleId={battleId} />
        <div className="grid grid-cols-2 grid-row-2 gap-4">
          <div className="row-span-2 ">
            <Cal />
          </div>
          <div className="row-span-1 col-start-2 ">
            <Todays />
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Problem() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProblemContent />
    </Suspense>
  );
}
