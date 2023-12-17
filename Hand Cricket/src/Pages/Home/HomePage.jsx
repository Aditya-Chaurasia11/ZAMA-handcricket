import React, { useEffect } from "react";
import dashboardimg from "../../images/das2.svg";
import zama from "../../images/zama.png";
import controller from "../../images/controller.png";
import ball from "../../images/ball.png";
import cross from "../../images/cross.png";
import cricket from "../../images/cricket.png";
import triangle from "../../images/triangle.png";

import "./homepage.css";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../context";

const Home = () => {
  const navigate = useNavigate();

  const { walletAddress, signer, contract, instance } = useGlobalContext();
  const checkmatches = async () => {
    const matchidx = await contract.mapaddress(walletAddress);

    if (matchidx?.toNumber() !== 0) navigate(`/match/${matchidx?.toNumber()}`);
  };
  useEffect(() => {
    contract && checkmatches();
  }, [contract, walletAddress]);

  return (
    <div className="home_page_container">
      <div className="home_page_upper">
        <div className="home_container_left">
          <h1>
            ZAMA'S{" "}
            <i>
              HAND <span>CRICKET</span>
            </i>
          </h1>
          <p>
            ZAMA'S hand cricket is fully onchain two player game. Unlocks
            ability <br />
            to play hand cricket with other player in real time.
          </p>
          <h2>
            Uses fully homomorphic encryption <br />
            to ensure security & privacy.
          </h2>
          <div className="home_button">
            <Link to="/create">
              <button className="home_button_button1">Create match</button>
            </Link>
            <Link to="/join">
              <button className="home_button_button2">Join match</button>
            </Link>
          </div>
        </div>
        <div className="home_container_right">
          <img src={dashboardimg}></img>
        </div>
        <img className="controller" src={controller}></img>
        <img className="ball" src={ball}></img>
        <img className="cross" src={cross}></img>
        <img className="cricket" src={cricket}></img>
        <img className="triangle" src={triangle}></img>
      </div>

      <div className="home_page_bottom">
        <div className="home_page_bottom_left">
          <img src={zama}></img>
        </div>
        <div className="home_page_bottom_right">
          <h1>
            Design for the Zama <br /> bounty program
          </h1>
          <p>
            There used to be a dilemma in blockchain: keep your application and
            user data on-chain, allowing everyone to see it, or keep it
            privately off-chain and lose contract composability. Thanks to a
            breakthrough in homomorphic encryption, Zama's fhEVM makes it
            possible to run confidential smart contracts on encrypted data,
            guaranteeing both confidentiality and composability.
          </p>
          <a href="https://docs.zama.ai/fhevm" target="_blank">
            <button>Read more</button>
          </a>
        </div>
      </div>

      <p className="copywrite">&#169; Designed by Aditya-Chaurasia11 </p>
    </div>
  );
};

export default Home;
