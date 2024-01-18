import React, { useEffect, useState } from "react";
import "./matchhome.css";
import avatar1 from "../../images/avatar1.png";
import avatar2 from "../../images/avatar2.png";

import { useGlobalContext } from "../../context";
import { useNavigate, useParams } from "react-router-dom/dist";
import Waiting from "../../components/Waiting";
import WaitingForMove from "../../components/WaitingForMove";
import DialogContentText from "@mui/material/DialogContentText";
import Slide from "@mui/material/Slide";
import bat from "../../images/bat.png";
import cricket_ball from "../../images/cricket-ball.png";
import WinnerCard from "../../components/FinalWinner";

import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const MatchHome = () => {
  const [pal1, setPlay1] = useState("");
  const [pal2, setPlay2] = useState("");
  const [isBat, setIsBat] = useState(Boolean);
  const [wait, setWait] = useState(Boolean);
  const [currPlayerIndex, setCurrPlayerIndex] = useState(0);
  const [lastPlaSr, setLastPlaSr] = useState(0);
  const [totalscorePla1, setTotalScorePla1] = useState(0);
  const [totalscorePla2, setTotalScorePla2] = useState(0);
  const [choice, setChoice] = useState(0);
  const [allPlayerScoreBatP1, setAllPlayerScoreBatP1] = useState([]);
  const [allPlayerScoreBatP2, setAllPlayerScoreBatP2] = useState([]);
  const [dataPlayer1, setDataPlyer1] = useState([]);
  const [dataPlayer2, setDataPlyer2] = useState([]);
  const [matchEnd, setMatchEnd] = useState(false);
  const [winnerAddress, setWinnerAddress] = useState();
  const [wicketP1, setwicketP1] = useState(0);
  const [wicketP2, setwicketP2] = useState(0);

  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const handleClick = async (e, ch) => {
    e.target.classList.add("clicked");
    setTimeout(() => {
      e.target.classList.remove("clicked");
    }, 350);
    setChoice(ch);

    try {
      const encreptedinput = instance.encrypt8(ch);

      const txn = await contract.registerMove(id, encreptedinput);
      await txn.wait();
      getMatchDetail();
    } catch (error) {
      console.log(error);
    }
  };

  const navigate = useNavigate();
  const { walletAddress, signer, contract, instance, publicK } =
    useGlobalContext();

  let { id } = useParams();
  const [isPlayer, setIsplayer] = useState(false);

  let generatedToken; 
  let signature;
  const SignEip712=async()=>{
     generatedToken = instance.generateToken({
      name: "Authorization token",
      verifyingContract: contract.address,
    });
    const params = [walletAddress, JSON.stringify(generatedToken.token)];
    signature =  window.ethereum.request({
      method: "eth_signTypedData_v4",
      params,
      });

  }
  useEffect(()=>{
    if(instance) SignEip712()
  },[instance])

  const getMatchDetail = async () => {
    try {
      const noofmatches = await contract.getnoofmatches();
      if (id >= Number(noofmatches)) {
        navigate("/");
      }
      let encreptedDetails;

     
      encreptedDetails = await contract?.getmatchesreEncrypted(generatedToken.publicKey, id, signature);
      console.log(encreptedDetails);

      const matchDetail = [
        instance.decrypt(contract.address, encreptedDetails[0]),
        instance.decrypt(contract.address, encreptedDetails[1]),
        encreptedDetails[2],
        [
          instance.decrypt(contract.address, encreptedDetails[3][0]),
          instance.decrypt(contract.address, encreptedDetails[3][1]),
        ],
        encreptedDetails[4],
        instance.decrypt(contract.address, encreptedDetails[5]),
        [
          instance.decrypt(contract.address, encreptedDetails[6][0]),
          instance.decrypt(contract.address, encreptedDetails[6][1]),
          instance.decrypt(contract.address, encreptedDetails[6][2]),
          instance.decrypt(contract.address, encreptedDetails[6][3]),
          instance.decrypt(contract.address, encreptedDetails[6][4]),
        ],
        [
          instance.decrypt(contract.address, encreptedDetails[7][0]),
          instance.decrypt(contract.address, encreptedDetails[7][1]),
          instance.decrypt(contract.address, encreptedDetails[7][2]),
          instance.decrypt(contract.address, encreptedDetails[7][3]),
          instance.decrypt(contract.address, encreptedDetails[7][4]),
        ],
        instance.decrypt(contract.address, encreptedDetails[8]),
      ];

      console.log(matchDetail[5]);

      if (matchDetail[0] === 1) {
        const winnerAdd = await contract.getwinner(id);
        setMatchEnd(matchDetail[0]);
        console.log("asdada", typeof winnerAdd);
        console.log("asdada", winnerAdd);
        setWinnerAddress(winnerAdd);
      }

      const data1 = [
        {
          name: "Player 1",
          score: matchDetail[6][0],
        },
        {
          name: "Player 2",
          score: matchDetail[6][1],
        },
        {
          name: "Player 3",
          score: matchDetail[6][2],
        },
        {
          name: "Player 4",
          score: matchDetail[6][3],
        },
        {
          name: "Player 5",
          score: matchDetail[6][4],
        },
      ];

      setDataPlyer1(data1);

      const data2 = [
        {
          name: "Player 1",
          score: matchDetail[7][0],
        },
        {
          name: "Player 2",
          score: matchDetail[7][1],
        },
        {
          name: "Player 3",
          score: matchDetail[7][2],
        },
        {
          name: "Player 4",
          score: matchDetail[7][3],
        },
        {
          name: "Player 5",
          score: matchDetail[7][4],
        },
      ];

      setDataPlyer2(data2);
      setAllPlayerScoreBatP1(matchDetail[6]);
      setAllPlayerScoreBatP2(matchDetail[7]);

      if (
        matchDetail[2][1].toLowerCase() !== walletAddress.toLowerCase() &&
        matchDetail[2][0].toLowerCase() !== walletAddress.toLowerCase()
      ) {
        navigate("/");
      }

      if (matchDetail[2][1].toLowerCase() === walletAddress.toLowerCase()) {
        setWait(matchDetail[4][1]);
      }
      if (matchDetail[2][0].toLowerCase() === walletAddress.toLowerCase()) {
        setWait(matchDetail[4][0]);
      }

      if (matchDetail[2][1].toLowerCase() !== zeroAddress.toLowerCase()) {
        setIsplayer(true);
      }

      console.log(matchDetail[2][1]);
      setPlay1(matchDetail[2][0]);
      setPlay2(matchDetail[2][1]);

      const isPlayer1Turn = matchDetail[1];

      console.log(
        walletAddress.toLowerCase() === matchDetail[2][0].toLowerCase() &&
          isPlayer1Turn
      );
      setIsBat(
        (walletAddress.toLowerCase() === matchDetail[2][0].toLowerCase() &&
          isPlayer1Turn) ||
          (walletAddress.toLowerCase() === matchDetail[2][1].toLowerCase() &&
            !isPlayer1Turn)
      );
      console.log(isPlayer1Turn);

      const currPlayerInd = matchDetail[5];
      setCurrPlayerIndex(currPlayerInd);

      //total score
      let totalscoreP1 = 0;
      for (let i = 0; i < 5; i++) {
        const temp = matchDetail[6][i];
        totalscoreP1 = totalscoreP1 + temp;
      }
      console.log(totalscoreP1);
      setTotalScorePla1(totalscoreP1);

      let totalscoreP2 = 0;
      for (let i = 0; i < 5; i++) {
        const temp = matchDetail[7][i];
        totalscoreP2 = totalscoreP2 + temp;
      }

      console.log(totalscoreP2);
      setTotalScorePla2(totalscoreP2);
      if (matchDetail[8] && matchDetail[1]) {
        setwicketP1(matchDetail[5]);
        setwicketP2(5);
      } else if (matchDetail[8] && !matchDetail[1]) {
        setwicketP1(matchDetail[5]);
        setwicketP2(5);
      } else if (!matchDetail[8] && matchDetail[1]) {
        setwicketP1(matchDetail[5]);
        setwicketP2(0);
      } else if (!matchDetail[8] && !matchDetail[1]) {
        setwicketP1(0);
        setwicketP2(matchDetail[5]);
      }

      if (isPlayer1Turn) {
        console.log(matchDetail[6]);
        const score = matchDetail[6][currPlayerInd];

        console.log(score);
        setLastPlaSr(score);

        console.log(matchDetail[6]);
      } else {
        const score = matchDetail[7][currPlayerInd];

        setLastPlaSr(score);
      }
    } catch (error) {
      console.log(error);
    }
  };

  contract?.on("playeradded", (...args) => {
    const [ind, add] = args;

    console.log("new added");
    if (ind == id) getMatchDetail();
  });

  contract?.on("roundend", (...args) => {
    const [index] = args;

    console.log("new round", index.toNumber());
    console.log(id);
    if (index.toNumber() == id) contract && getMatchDetail();
  });

  useEffect(() => {
    getMatchDetail();
  }, [walletAddress, contract, publicK]);

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [open2, setOpen2] = useState(false);

  const handleClickOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
  };

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
    <>
      {!matchEnd ? (
        <>
          {isPlayer ? (
            <>
              {!wait ? (
                <div className={`matchhome_container`}>
                  <>
                    <div className="matchhome_container_upper">
                      <div className="matchhome_container_upper_first">
                        <div className="matchhome_container_upper_first_img">
                          <img src={avatar1}></img>
                        </div>
                        <div className="matchhome_container_upper_first_run">
                          <p>{pal1?.slice(0, 5)}...</p>
                          <hr></hr>

                          <p>
                            {totalscorePla1}/{wicketP1}
                          </p>
                        </div>
                      </div>
                      <div className="matchhome_container_upper_second">
                        <div className="matchhome_container_upper_second_up">
                          <p className="para">
                            {isBat ? "Your's" : "Opponent's "}
                          </p>

                          <hr />
                          <div className="matchhome_container_upper_second_current">
                            <p>{lastPlaSr}</p>
                          </div>
                        </div>
                        <div className="matchhome_container_upper_second_down">
                          <p className="para2"></p>
                          <p className="para2">
                            Player
                            {currPlayerIndex + 1} Batting
                          </p>
                        </div>
                      </div>
                      <div className="matchhome_container_upper_third">
                        <div className="matchhome_container_upper_first_img">
                          <img src={avatar2}></img>
                        </div>
                        <div className="matchhome_container_upper_first_run">
                          <p>{pal2?.slice(0, 5)}...</p>
                          <hr></hr>
                          <p>
                            {totalscorePla2}/{wicketP2}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="matchhome_container_lower">
                      <div className="matchhome_container_lower_container">
                        <div className="matchhome_container_lower_lower_left">
                          <button variant="outlined" onClick={handleClickOpen}>
                            View score
                          </button>
                          <BootstrapDialog
                            open={open}
                            TransitionComponent={Transition}
                            keepMounted
                            aria-labelledby="customized-dialog-title"
                            className="dialog_box"
                            maxWidth="xl"
                          >
                            <DialogTitle
                              sx={{ m: 0, p: 2 }}
                              id="customized-dialog-title"
                            >
                              Full match score
                            </DialogTitle>

                            <IconButton
                              aria-label="close"
                              onClick={handleClose}
                              sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                              }}
                            >
                              <CloseIcon />
                            </IconButton>

                            <DialogContent>
                              <DialogContentText
                                id="alert-dialog-slide-description"
                                className="dialogbox_container"
                              >
                                {/* {allPlayerScoreBat.map((k) =>
                              instance.decrypt(contract.address, k)
                            )} */}

                                <TableContainer component={Paper}>
                                  <p className="table_p">{pal1.slice(0, 15)}</p>
                                  <hr />
                                  <Table
                                    sx={{ minWidth: 400 }}
                                    aria-label="simple table"
                                  >
                                    <TableHead>
                                      <TableRow>
                                        <TableCell align="center">
                                          Player
                                        </TableCell>
                                        <TableCell align="center">
                                          Score
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {allPlayerScoreBatP1.map((k, ind) => (
                                        <TableRow
                                          key={ind}
                                          sx={{
                                            "&:last-child td, &:last-child th":
                                              {
                                                border: 0,
                                              },
                                          }}
                                        >
                                          <TableCell
                                            component="th"
                                            scope="row"
                                            align="center"
                                          >
                                            {ind + 1}
                                          </TableCell>
                                          <TableCell align="center">
                                            {k}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>

                                <TableContainer component={Paper}>
                                  <p className="table_p">{pal2.slice(0, 15)}</p>
                                  <hr></hr>

                                  <Table
                                    sx={{ minWidth: 400 }}
                                    aria-label="simple table"
                                  >
                                    <TableHead>
                                      <TableRow>
                                        <TableCell align="center">
                                          Player
                                        </TableCell>
                                        <TableCell align="center">
                                          Score
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {allPlayerScoreBatP2.map((k, ind) => (
                                        <TableRow
                                          key={ind}
                                          sx={{
                                            "&:last-child td, &:last-child th":
                                              {
                                                border: 0,
                                              },
                                          }}
                                        >
                                          <TableCell
                                            component="th"
                                            scope="row"
                                            align="center"
                                          >
                                            {ind + 1}
                                          </TableCell>
                                          <TableCell align="center">
                                            {k}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </DialogContentText>
                            </DialogContent>
                          </BootstrapDialog>
                        </div>
                        <div className="matchhome_container_lower_upper">
                          <img src={isBat ? bat : cricket_ball}></img>
                          <p>{isBat ? "| Batting " : "| Bowling"}</p>
                        </div>
                        <div className="matchhome_container_lower_lower_left">
                          <button variant="outlined" onClick={handleClickOpen2}>
                            View graph
                          </button>
                          <BootstrapDialog
                            open={open2}
                            TransitionComponent={Transition}
                            keepMounted
                            aria-labelledby="customized-dialog-title"
                          >
                            <DialogTitle
                              sx={{ m: 0, p: 2 }}
                              id="customized-dialog-title"
                            >
                              Full match score
                            </DialogTitle>

                            <IconButton
                              aria-label="close"
                              onClick={handleClose2}
                              sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                              }}
                            >
                              <CloseIcon />
                            </IconButton>

                            <DialogContent>
                              <DialogContentText id="alert-dialog-slide-description">
                                {/* {allPlayerScoreBat.map((k) =>
                              instance.decrypt(contract.address, k)
                            )} */}
                                <p style={{ textAlign: "center" }}>
                                  {pal1?.slice(0, 20)}...
                                </p>

                                <ResponsiveContainer width={500} aspect={3}>
                                  <BarChart
                                    data={dataPlayer1}
                                    width={400}
                                    height={400}
                                  >
                                    <XAxis dataKey={"name"} />
                                    <YAxis />

                                    <Bar dataKey={"score"} fill="#8883d8" />
                                  </BarChart>
                                </ResponsiveContainer>
                                <p style={{ textAlign: "center" }}>
                                  {pal2?.slice(0, 20)}...
                                </p>

                                <ResponsiveContainer width={500} aspect={3}>
                                  <BarChart
                                    data={dataPlayer2}
                                    width={400}
                                    height={400}
                                  >
                                    <XAxis dataKey={"name"} />
                                    <YAxis />

                                    <Bar dataKey={"score"} fill="#8883d8" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </DialogContentText>
                            </DialogContent>
                          </BootstrapDialog>
                        </div>
                      </div>

                      <div className="matchhome_container_lower_lower ">
                        <button
                          className="lifted-button"
                          onClick={(e) => handleClick(e, 1)}
                        >
                          1
                        </button>
                        <button
                          className="lifted-button"
                          onClick={(e) => handleClick(e, 2)}
                        >
                          2
                        </button>
                        <button
                          className="lifted-button"
                          onClick={(e) => handleClick(e, 3)}
                        >
                          3
                        </button>
                        <button
                          className="lifted-button"
                          onClick={(e) => handleClick(e, 4)}
                        >
                          4
                        </button>
                        <button
                          className="lifted-button"
                          onClick={(e) => handleClick(e, 5)}
                        >
                          5
                        </button>
                        <button
                          className="lifted-button"
                          onClick={(e) => handleClick(e, 6)}
                        >
                          6
                        </button>
                      </div>
                    </div>
                  </>
                  <div className="leave_match">
                    <button onClick={leaveMatchHandler}>Leave</button>
                  </div>
                </div>
              ) : (
                <WaitingForMove num={choice} />
              )}
            </>
          ) : (
            <Waiting />
          )}
        </>
      ) : (
        <WinnerCard add={winnerAddress} />
      )}
    </>
  );
};

export default MatchHome;
