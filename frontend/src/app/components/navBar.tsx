"use client";
import React, { useState } from "react";

const navLinks = [
  { name: "home", href: "#home" },
  { name: "problem", href: "#problem" },
  { name: "battle", href: "#battle" },
  { name: "contest", href: "#contest" },
];

export default function NavBar() {
  const [active, setActive] = useState("problem");

  return (
    <nav className="flex items-center justify-center px-7 py-7 bg-[#F0F1F6] h-[8vh]">
      <div className="flex items-center gap-2">
        <img src="/light-logo.png" alt="Logo" className="h-10" />
        <span className="font-bold text-[27px] text-gray-800">
          <span className="text-gray-800">Syntax</span>
          <span className="text-[#D4BF20]">Rush</span>
        </span>
      </div>

      <div className="flex-1 flex  justify-center">
        <div className="flex gap-6 px-2 py-1 mr-[7%] mt-1 rounded-full border border-gray-400 bg-white/50 shadow-sm">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={
                `px-5 py-2 rounded-full font-semibold transition  active:bg-gray-800 active:text-white` +
                (active === link.name
                  ? " bg-[#1F2937] text-white pt-2.5"
                  : " hover:bg-gray-100 pt-3 text-[#484848]")
              }
              onClick={() => setActive(link.name)}
              style={{ textTransform: "none" }}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      <div>
        <img
          src="/profile.png"
          alt="Profile"
          className="h-14 w-14 rounded-full bg-gray-300 object-cover"
        />
      </div>
    </nav>
  );
}
