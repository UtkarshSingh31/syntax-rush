"use client";
import { useState } from "react";
import React from "react";
import NavBar from "@/app/components/navBar";
import Prog from "@/app/components/problem/prog";
import Cal from "@/app/components/problem/cal";
import Chat from "@/app/components/problem/chat";
import Ques from "@/app/components/problem/ques";
import Todays from "@/app/components/problem/todays";

export default function Problem() {
  const [showChat, setShowChat] = useState(true);
  const [showQues, setShowQues] = useState(true);
  const handleShow = () => {
    setShowChat(!showChat);

    setTimeout(() => setShowQues(!showQues), 200);
  };
  return (
    <div className="min-h-screen pb-10">
      <NavBar />

      <div className="hidden lg:grid grid-cols-5 grid-rows-5 gap-4 relative">
        <div className="row-span-1 col-start-5 row-start-1 mr-10">
          <Cal />
        </div>
        <div className="col-start-5 row-start-2 mr-10">
          <Todays />
        </div>

        <div
          className={`row-start-1 transition-transform duration-700  ${
            showQues ? "col-span-3 col-start-2" : "col-span-4 col-start-1 ml-10"
          }`}
        >
          <Prog />
        </div>

        {/* Ques */}
        <div
          className={`row-span-4 row-start-2 transition-transform duration-700  ${
            showQues ? "col-span-3 col-start-2" : "col-span-4 col-start-1 ml-10"
          }`}
        >
          <Ques />
        </div>

        {/* Chat panel */}
        <div
          className={`row-span-2 col-start-1 row-start-1  bg-gray-100  relative transform transition-transform duration-700 ease-in-out ${
            showChat ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Chat />

          {/* Toggle button on edge of chat */}
          <button
            onClick={() => handleShow()}
            className={`absolute top-1/2 right-1 translate-x-full -translate-y-1/2 bg-[#fcfcff] text-slate-500  px-1 py-2 rounded-r transition-colors duration-300 hover:bg-gray-100  ${
              showChat
                ? "border-r-2 border-y-2 border-[#EBEBF3]"
                : "border-r-2 border-y-2 border-[#EBEBF3]"
            }`}
          >
            {showChat ? "く" : "➦"}
          </button>
        </div>
      </div>

      {/* <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-7 gap-2 min-h-screen  mx-10">
        <div className="col-span-3 row-span-2">
          <Prog />
        </div>
        <div className="col-span-3 row-span-5 col-start-1 row-start-3">
          <Ques />
        </div>
        <div className="row-span-3 col-start-4 row-start-1">
          <Cal />
        </div>
        <div className="col-start-4 row-start-4">
          <Todays />
        </div>
        <div className="row-span-3 col-start-4 mt-4 row-start-5">
          <Chat />
        </div>
      </div> */}

      <div className="lg:hidden md:hidden flex flex-col gap-6 p-4">
        <Prog />
        <Ques />
        <Cal />
        <Todays />
        <Chat />
      </div>

      <div className="lg:hidden  sm:hidden md:flex flex-col gap-6 ">
        <Prog />
        <Ques />
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
