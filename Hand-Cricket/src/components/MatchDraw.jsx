import React, { useEffect, useState } from "react";
import "./css/finalwinner.css";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { useGlobalContext } from "../context";
import { useNavigate, useParams } from "react-router-dom";

const Waiting = ({ add }) => {
  let { id } = useParams();
  const navigate = useNavigate();

  const { width, height } = useWindowSize();
  const { walletAddress, signer, contract, instance, publicK } =
    useGlobalContext();

  const leaveMatchHandler = async () => {
    try {
      const txn = await contract.leaveMatch(id);
      await txn.wait();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="waitingformove_background">
      <div className="waitingformove_blurred"></div>
      <div className="waitingformove_container">
        <div className="waitingformove_container_card">
          {/* <Confetti width={width} height={height} /> */}
          <h1>Match is draw ...</h1>
          <div className="final_winner">
            <button className="lifted-button" onClick={leaveMatchHandler}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Waiting;
