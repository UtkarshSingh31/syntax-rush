import React from "react";
import Vs from "../components/battle/vs";
import NavBar from "../components/navBar";
import Lb from "../components/battle/lb";

export default function page() {
  return (
    <div>
      <NavBar />
      <Vs />
      <Lb />
    </div>
  );
}
