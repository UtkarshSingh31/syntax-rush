import React from "react";
import NavBar from "@/app/components/navBar";
import Prog from "@/app/components/problem/prog";
import Cal from "@/app/components/problem/cal";
import Chat from "@/app/components/problem/chat";
import Ques from "@/app/components/problem/ques";
import Todays from "@/app/components/problem/todays";

export default function Problem() {
  return (
    <div>
      <NavBar />

      <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-7 gap-6  min-h-screen max-h-[85vh] mx-10">
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
      </div>

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
