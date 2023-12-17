import React, { useEffect, useState } from "react";
import "./css/waitingformove.css";

const Waiting = ({ num }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const text = "...";
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else {
        setDisplayText(""); // Clear the text to restart typing
        setCurrentIndex(0);
      }
    }, 600);

    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, [currentIndex, text]);

  return (
    <div className="waitingformove_background">
      <div className="waitingformove_blurred"></div>
      <div className="waitingformove_container">
        <div className="waitingformove_container_card">
          <h1>
            You choose {num} waiting for other player response <span>{displayText}</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Waiting;
