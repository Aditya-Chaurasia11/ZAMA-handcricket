import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context";

import "./join.css";
import CardAvaMatches from "../../components/CardAvaMatches";

const Join = () => {
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const { contract,signature } = useGlobalContext();
  const [allMatchesList, setAllMatchesList] = useState([]);

  const getAllMatches = async () => {
    console.log(contract);
    const getAllMatches = await contract.getallmatches();

    console.log(getAllMatches);
    
    setAllMatchesList(getAllMatches);
  };

  useEffect(() => {
    contract && getAllMatches();
  }, [contract,signature]);

  return (
    <div className="join_container">
      <h1>Join matches</h1>

      <div className="join_container_body">
        <div id="nav1" className="home_nav_div_container">
          <p className={"active join_nav"}>All matches</p>
        </div>

        <div>
          <div id="component1" className="join_card_container">
            {allMatchesList.map((k, ind) => {
              if (
                k[2][1].toLowerCase() === zeroAddress &&
                k[2][0].toLowerCase() !== zeroAddress
              ) {
                return (
                  <CardAvaMatches
                    add={k[2][0]}
                    id={ind}
                    status={"Waiting for player"}
                    key={ind}
                    flag={true}
                  />
                );
              } else if (
                k[2][1].toLowerCase() !== zeroAddress &&
                k[2][0].toLowerCase() !== zeroAddress
              ) {
                return (
                  <CardAvaMatches
                    add={k[2][0]}
                    id={ind}
                    status={"Ongoing"}
                    key={ind}
                    flag={false}
                  />
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Join;
