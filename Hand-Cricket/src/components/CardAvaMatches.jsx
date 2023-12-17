import React from "react";
import "./css/cardavamat.css";
import { useGlobalContext } from "../context";
import { useNavigate } from "react-router-dom";

const CardAvaMatches = ({ add, id, status, flag }) => {
  const navigate = useNavigate();
  const { contract } = useGlobalContext();
  const joinHandler = async (e, ind) => {
    if (flag) {
      e.target.classList.add("clicked");
      setTimeout(async () => {
        e.target.classList.remove("clicked");
      }, 350);
      const tx = await contract.joinMatch(ind);
      await tx.wait();
      navigate(`/match/${ind}`);
    }
  };
  return (
    <div className="card_ava_container">
      <div className="card_ava_container_upper">
        <p className="host">Host : {add.slice(0, 22)}</p>
        <div className="card_ava_container_middle">
          <p className="room">Room Code : {id}</p>
          <p>Status : {status}</p>
        </div>
      </div>
      <button className="lifted-button" onClick={(e) => joinHandler(e, id)}>
        {!flag ? "Slot Full" : "Join now"}
      </button>
    </div>
  );
};

export default CardAvaMatches;
