// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "fhevm/lib/TFHE.sol";
import "fhevm/abstracts/EIP712WithModifier.sol";


contract multiHandCricketGame is EIP712WithModifier  {

    struct Match{
        ebool isMatchFinished;
        ebool isplayer1Turn;
        address[2] players;
        euint8[2] lastball;
        bool[2] moves;
        euint8 currplayer;
        euint8[5] player1score;
        euint8[5] player2score;
        ebool isSecondinnings;
        address winner;
    }

    struct MatchReencrypted{
        bytes isMatchFinished;
        bytes isplayer1Turn;
        address[2] players;
        bytes[2] lastball;
        bool[2] moves;
        bytes currplayer;
        bytes[5] player1score;
        bytes[5] player2score;
        bytes isSecondinnings;
        address winner;
    }


    mapping (address=>uint)public mapaddress;
    Match[] public matches;

    constructor() EIP712WithModifier("Authorization token", "1"){
        // inital(); // initalize matches array
    } 
    event playeradded(uint index,address player);
    event roundend(uint index);


    function getmatches(uint8 idx) public view returns(Match memory){
        return matches[idx];
    }

    function getallmatches() public view returns (Match[] memory){
        return matches;
    }
    
    function getmatchesreEncrypted(bytes32 pk,uint8 idx,bytes memory signature) onlySignedPublicKey(pk, signature) public view returns (MatchReencrypted memory){
        
        if(matches[idx].players[0]==msg.sender){
            return MatchReencrypted(
            TFHE.reencrypt(matches[idx].isMatchFinished,pk),
            TFHE.reencrypt(matches[idx].isplayer1Turn,pk),
            matches[idx].players,
            [TFHE.reencrypt(matches[idx].lastball[0],pk),TFHE.reencrypt(TFHE.asEuint8(0),pk)],
            matches[idx].moves,
            TFHE.reencrypt(matches[idx].currplayer,pk),
            [TFHE.reencrypt(matches[idx].player1score[0],pk),TFHE.reencrypt(matches[idx].player1score[1],pk),TFHE.reencrypt(matches[idx].player1score[2],pk),TFHE.reencrypt(matches[idx].player1score[3],pk),TFHE.reencrypt(matches[idx].player1score[4],pk)],
            [TFHE.reencrypt(matches[idx].player2score[0],pk),TFHE.reencrypt(matches[idx].player2score[1],pk),TFHE.reencrypt(matches[idx].player2score[2],pk),TFHE.reencrypt(matches[idx].player2score[3],pk),TFHE.reencrypt(matches[idx].player2score[4],pk)],
            TFHE.reencrypt(matches[idx].isSecondinnings,pk),
            matches[idx].winner

        );
        }else if(matches[idx].players[1]==msg.sender){
            return MatchReencrypted(
            TFHE.reencrypt(matches[idx].isMatchFinished,pk),
            TFHE.reencrypt(matches[idx].isplayer1Turn,pk),
            matches[idx].players,
            [TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(matches[idx].lastball[1],pk)],
            matches[idx].moves,
            TFHE.reencrypt(matches[idx].currplayer,pk),
            [TFHE.reencrypt(matches[idx].player1score[0],pk),TFHE.reencrypt(matches[idx].player1score[1],pk),TFHE.reencrypt(matches[idx].player1score[2],pk),TFHE.reencrypt(matches[idx].player1score[3],pk),TFHE.reencrypt(matches[idx].player1score[4],pk)],
            [TFHE.reencrypt(matches[idx].player2score[0],pk),TFHE.reencrypt(matches[idx].player2score[1],pk),TFHE.reencrypt(matches[idx].player2score[2],pk),TFHE.reencrypt(matches[idx].player2score[3],pk),TFHE.reencrypt(matches[idx].player2score[4],pk)],
            TFHE.reencrypt(matches[idx].isSecondinnings,pk),
            matches[idx].winner
        );
        }
        else{
            return MatchReencrypted(
            TFHE.reencrypt(TFHE.asEbool(false),pk),
            TFHE.reencrypt(TFHE.asEbool(false),pk),
            matches[idx].players,
            [TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(TFHE.asEuint8(0),pk)],
            matches[idx].moves,
            TFHE.reencrypt(TFHE.asEuint8(0),pk),
            [TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(TFHE.asEuint8(0),pk)],
            [TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(TFHE.asEuint8(0),pk),TFHE.reencrypt(TFHE.asEuint8(0),pk)],
            TFHE.reencrypt(TFHE.asEuint8(0),pk),
            matches[idx].winner
        );
        }
    }


    function getnoofmatches() public view returns(uint){
        return matches.length;
    }

    function getlastToss(bytes32  pk) public view returns(bytes memory ){
        return TFHE.reencrypt(matches[matches.length-1].isplayer1Turn,pk);
    }
    
    function createMatch(bool _toss) public {
        require(mapaddress[msg.sender]==0,"already ingame");
        
        euint8 rand=TFHE.randEuint8();
        ebool randbool=TFHE.asEbool(TFHE.and(rand,TFHE.asEuint8(1)));

        ebool ispalyer1TurnTFHE = TFHE.not(TFHE.xor(randbool,TFHE.asEbool(_toss)));

        euint8[5] memory emptyarray;

        for(uint8 i=0;i<5;i++){
            emptyarray[i]=TFHE.asEuint8(0);
        }

        address[2] memory addresses=[msg.sender,address(0)];
        bool[2] memory moves=[false,false];

        matches.push(
            Match(
            TFHE.asEbool(false),
            ispalyer1TurnTFHE,
            addresses,
            [TFHE.asEuint8(0),TFHE.asEuint8(0)],
            moves,
            TFHE.asEuint8(0),
            emptyarray,
            emptyarray,
            TFHE.asEbool(false),
            address(0)
        )
        );

        mapaddress[msg.sender]=matches.length-1;

    } 
    function joinMatch(uint idx) public{
        require(mapaddress[msg.sender]==0,"already in game");
        Match storage Usermatch=matches[idx];
        
        
        mapaddress[msg.sender]=idx;
        Usermatch.players[1]=msg.sender;
        matches[idx]=Usermatch;

        emit playeradded (idx,msg.sender);
    }

    function leaveMatch(uint idx)public {
        Match storage Usermatch=matches[idx];
        require(Usermatch.players[0]==msg.sender||Usermatch.players[0]==msg.sender,"you are not in match");
        Usermatch.isMatchFinished=TFHE.asEbool(true);
        if(Usermatch.players[0]==msg.sender){
            Usermatch.winner=Usermatch.players[1];
        }

        if(Usermatch.players[1]==msg.sender){
            Usermatch.winner=Usermatch.players[0];
        }

        mapaddress[Usermatch.players[0]]=0;
        mapaddress[Usermatch.players[1]]=0;

        matches[idx]=Usermatch;
    }

    function registerMove(uint idx,bytes memory EncreptedBall) public {
        require(TFHE.decrypt(TFHE.le(TFHE.asEuint8(EncreptedBall),6)));
        
        
        Match storage Usermatch=matches[idx];
        require(Usermatch.players[1]!=address(0),"Player has Not Yet joined");
        require(TFHE.decrypt(TFHE.not(Usermatch.isMatchFinished)));
        
        
        if (Usermatch.players[0]==msg.sender){

            require(Usermatch.moves[0]==false,"you have already made a move");
            require(TFHE.decrypt(TFHE.eq(Usermatch.lastball[0],0)));
            Usermatch.lastball[0]=TFHE.asEuint8(EncreptedBall);
            Usermatch.moves[0]=true;
        }
        else
            if (Usermatch.players[1]==msg.sender){
            require(Usermatch.moves[1]==false,"you have already made a move");
            require(TFHE.decrypt(TFHE.eq(Usermatch.lastball[1],0)));
            Usermatch.lastball[1]=TFHE.asEuint8(EncreptedBall);
            Usermatch.moves[1]=true;
        }
        matches[idx]=Usermatch;
        if(Usermatch.moves[0]&&Usermatch.moves[1]){
            _awaitMatch(idx);
        }

        }

    


    



    function _awaitMatch(uint idx) internal{
        Match storage Usermatch=matches[idx];

        ebool isout=TFHE.eq(Usermatch.lastball[0],Usermatch.lastball[1]); // check whether player is out

        ebool is_out_and_nextplayer=TFHE.and(isout,TFHE.lt(Usermatch.currplayer,4)); // checks whether out and next player should bat 
        ebool is_out_and_nextinnigs=TFHE.and(isout,TFHE.eq(Usermatch.currplayer,4)); // checks whether player is out and next innings should begin

        Usermatch.currplayer=TFHE.cmux(is_out_and_nextplayer,TFHE.add(Usermatch.currplayer,1),Usermatch.currplayer); // updates currplayer if is_out_and_nextplayer is true


        Usermatch.isMatchFinished =TFHE.and(is_out_and_nextinnigs,Usermatch.isSecondinnings); // updated matchFinished
        Usermatch.isSecondinnings=TFHE.cmux(is_out_and_nextinnigs,TFHE.asEbool(true),Usermatch.isSecondinnings); // updates issecondinnings if last player is out and 
        

        Usermatch.isplayer1Turn=TFHE.cmux(is_out_and_nextinnigs,TFHE.not(Usermatch.isplayer1Turn),Usermatch.isplayer1Turn); // updates is player1 turn if innings changed
        Usermatch.currplayer=TFHE.cmux(is_out_and_nextinnigs,TFHE.asEuint8(0),Usermatch.currplayer); // updates currplayer if innings changed

        ebool isplayer1Hit=TFHE.and(TFHE.not(isout),Usermatch.isplayer1Turn); // checks whether player1 hit the ball
        ebool isplayer2Hit=TFHE.and(TFHE.not(isout),TFHE.not(Usermatch.isplayer1Turn)); // checks whether player2 hit ball

        for(uint8 i=0;i<5;i++){
            // updates players score
        Usermatch.player1score[i]=TFHE.cmux(TFHE.and(isplayer1Hit,TFHE.eq(Usermatch.currplayer,i)),Usermatch.player1score[i]+Usermatch.lastball[0],Usermatch.player1score[i]);
        Usermatch.player2score[i]=TFHE.cmux(TFHE.and(isplayer2Hit,TFHE.eq(Usermatch.currplayer,i)),Usermatch.player2score[i]+Usermatch.lastball[1],Usermatch.player2score[i]);
        }

        // reset the moves
        Usermatch.moves=[false,false];
        Usermatch.lastball=[TFHE.asEuint8(0),TFHE.asEuint8(0)];

       
        
        matches[idx]=Usermatch;

        emit roundend(idx);
    }

    function getwinner(uint idx) public view returns(address winner ,bool isdraw){
        require(TFHE.decrypt(matches[idx].isMatchFinished));
        
        Match storage Usermatch = matches[idx];  
        require(Usermatch.players[0]==msg.sender||Usermatch.players[1]==msg.sender,"you are not member of match");
        euint8 player1score=Usermatch.player1score[0]+Usermatch.player1score[1]+Usermatch.player1score[2]+Usermatch.player1score[3]+Usermatch.player1score[4];
        euint8 player2score=Usermatch.player2score[0]+Usermatch.player2score[1]+Usermatch.player2score[2]+Usermatch.player2score[3]+Usermatch.player2score[4];
        if(Usermatch.winner!=address(0)){
            winner=Usermatch.winner;
        }
        else{

        if(TFHE.decrypt(TFHE.gt(player1score,player2score))){
            winner= Usermatch.players[0];
        }
        else if (TFHE.decrypt(TFHE.lt(player1score,player2score))){
            winner= Usermatch.players[1];
        }
        else{
            isdraw=true;
        }
        }
        
    }

    
    
}