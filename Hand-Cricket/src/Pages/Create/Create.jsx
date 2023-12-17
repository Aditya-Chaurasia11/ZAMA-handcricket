import React, { useState, useEffect } from "react";
import "./Create.css";
import coin from "../../images/coin-tail-removebg-preview.png";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom/dist";
import { useGlobalContext } from "../../context";

const Create = () => {
  const { signer, contract, instance, publicK } = useGlobalContext();

  const { width, height } = useWindowSize();

  const [toss, setToss] = useState(false);
  const [name, setName] = useState(1);
  const [choose, setChoose] = useState(false);
  const [win, setWin] = useState(0);
  const [id, setId] = useState(0);

  const navigate = useNavigate();

  const handleClick = async (choice, e) => {
    e.target.classList.add("clicked");
    try {
      setTimeout(async () => {
        e.target.classList.remove("clicked");
        setName(choice);
        setToss(true);

        if (signer && contract && publicK.length > 0) {
          try {
            const txn = await contract.createMatch(choice);
            await txn.wait();

            const lastMatchDetail = await contract.getlastToss(publicK);

            const iswon = instance.decrypt(contract.address, lastMatchDetail);

            setWin(iswon);

            const matchidx = await contract.getnoofmatches();

            setId(matchidx.toNumber() - 1);
            setChoose(true);
          } catch (error) {
            setToss(false);
            console.log(error);
          }
        }
      }, 350);
    } catch (error) {
      console.log(error);
    }
  };

  const startgameHandler = (e) => {
    e.target.classList.add("clicked");
    setTimeout(() => {
      e.target.classList.remove("clicked");
      navigate(`/match/${id}`);
    }, 350);
  };

  return (
    <div className="headortail_container">
      <div className="headortail_container_card">
        {!toss ? (
          <>
            <div className="headortail_container_upper">
              <h1>What do you call?</h1>
            </div>
            <div className="headortail_container_lower">
              <button
                className="lifted-button"
                onClick={(e) => handleClick(1, e)}
              >
                Heads
              </button>
              <button
                className="lifted-button"
                onClick={(e) => handleClick(0, e)}
              >
                Tails
              </button>
            </div>
          </>
        ) : !choose ? (
          <div className="coin_container">
            <h1>You choose {name === 1 ? "Head" : "Tail"}</h1>
            <div className="coin rotate">
              <img className="front" src={coin}></img>
            </div>
          </div>
        ) : (
          <div className="result_container">
            {win ? <Confetti width={width} height={height} /> : ""}
            <h1>{win ? "You won the toss " : "You lost the toss"}</h1>

            <div className="result_container_lower">
              <button
                className="lifted-button"
                onClick={(e) => startgameHandler(e)}
              >
                Start Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;
