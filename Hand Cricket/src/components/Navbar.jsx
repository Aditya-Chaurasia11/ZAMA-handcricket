import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "./css/navbar.css";
import logo from "../images/logo.png";
import { useGlobalContext } from "../context";

const Navbar = () => {
  const { walletAddress, signer, contract, instance } = useGlobalContext();


  return (
    <div className="gpt3__navbar">
      <div className="gpt3__navbar-links">
        <div className="gpt3__navbar-links_logo">
          <Link to="/">
            <img src={logo}></img>
          </Link>
        </div>
      </div>

      <div className="gpt3__navbar-sign">
        <button type="button">
          {walletAddress ? walletAddress.slice(0, 8) + "..." : "Add account"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
