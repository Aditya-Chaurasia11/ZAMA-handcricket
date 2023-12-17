
## Run Hardhat Project

Run Docker Image Locally for local development

```
docker run -i -p 8545:8545 --rm --name fhevm ghcr.io/zama-ai/evmos-dev-node:v0.1.10
```

Install dependencies

```
npm install
```

compile Contract
```
npx hardhat compile
```

deploy Contract

```
npx hardhat run scripts/deploy.js
```

run Tests 
```
npx hardhat test
```


# Use of Fhevm
**How you used FHEvm in your Game smart contract**:

 **Privacy-preserving calculations**: You used FHEvm to perform various calculations on the encrypted game state, ensuring that the actual values of sensitive data like scores and moves remain hidden from unauthorized parties. This includes:

 - ***Encrypted scorekeeping***: player1score and player2score are stored as encrypted arrays, allowing for secure addition and comparison without revealing the individual scores.

- ***Encrypted move validation***: Functions like registerMove use FHE operations to ensure valid moves within the game rules without revealing the actual move values.
- ***Encrypted game state updates***: Functions like _awaitMatch update the encrypted game state based on player moves and game logic, preserving privacy throughout.

**Fully Homomorphic encryption features**: we leveraged specific FHE functionalities to achieve desired game mechanics:
 - ***Conditional updates***: `cmux` function conditionally updates encrypted values based on other encrypted conditions, allowing for dynamic game progression based on player actions.
 - ***Conditional Require***:`optReq` used for using require to check the conditions of encrepted values
 - ***Homomorphic operations*** :Encrypted values can be added and subtracted without revealing their underlying data.
- ***Homomorphic comparisons***: Operations like `eq` and `le` are used to compare encrypted values without revealing the actual data, enabling fair and secure game logic.
- ***Private random number generation***: `randEuint8` provides homomorphically encrypted random numbers, ensuring unpredictability while maintaining privacy.

**Core problem solved by using FHEvm**:
The core problem you addressed with FHEvm is preserving the privacy of sensitive game data:

- Players' scores and moves are never revealed in plain text, preventing cheating or unfair advantage based on private information.
- The game state remains encrypted throughout the gameplay, protecting against unauthorized access or manipulation.
- This enables a trustless and secure gaming environment where players can compete without compromising their privacy.


- Verifiable computation: Anyone can verify the correctness of the game logic without needing to trust the smart contract provider.
- Fraud prevention: Tampering with the game state becomes computationally expensive and impractical.
- Scalability: FHEvm can handle complex game logic and large numbers of players efficiently.
By using FHEvm, you have created a privacy-preserving game smart contract that enables secure and fair gameplay without compromising player data confidentiality. This is a significant innovation in the field of blockchain gaming and opens up new possibilities for secure and trustless gaming experiences.

# Contract explaination 


## Match Structure:

The Match struct stores all the crucial details of a Hand Cricket game:

- `isMatchFinished`: Boolean indicating if the game is completed.
- `isplayer1Turn`: Boolean tracking whose turn it is to bat (Player 1 or 2).
- `players`: Array holding addresses of both players.
- `lastball`: Array containing the encrypted scores of the last ball bowled to each player.
- `moves`: Boolean array indicating if each player has played their shot for the current turn (both False by default).
- `currplayer`: Encrypted integer representing the current batsman (index in the players array).
- `player1score` and `player2score`: Encrypted arrays storing the individual scores of each player's 5 teammates.
- `isSecondinnings`: Boolean indicating whether the second innings have begun.

***Privacy-Preserving Features***:

- `ebool` and `euint8`: These data types ensure the privacy of game state information by keeping actual values encrypted.
- Homomorphic operations: Calculations like score addition and comparison are performed directly on encrypted data, preventing unauthorized access to raw values.

# Game Flow:

****1.Match Creation:****

when 
a user want to create a Match user need to pass a bool parameter 
```
        false = "Tail"
        true = "Head"
```
In create Match function we call TFHE.randEuint8 function to get a random number and we consider the first bit of random number to Toss
```
        euint8 rand=TFHE.randEuint8();
        ebool randbool=TFHE.asEbool(TFHE.and(rand,TFHE.asEuint8(1)));
        ebool ispalyer1TurnTFHE =TFHE.and(randbool,TFHE.asEbool(_toss));
```

then we push a Match struct with the toss details and Player1 details so now the struct will be waiting for player 2 and assign the index of match struct with address of player1 in mapaddress mapping

```
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
            TFHE.asEbool(false)
        )
        );
```

****2. Join Match****

we check whether user is assigned to another match or not 
if user in not assigned to other match we add the user details in struct and assign user the match index

```
    function joinMatch(uint idx) public{
        require(mapaddress[msg.sender]==0,"already in game");
        Match storage Usermatch=matches[idx];
        
        
        mapaddress[msg.sender]=idx;
        Usermatch.players[1]=msg.sender;
        matches[idx]=Usermatch;
        
        emit playeradded (idx,msg.sender);
    }
```

****3.Register Move****

we check whether player1 is joined and store encrepted detalis given by user in match struct 

if both players made a move contract automatically trigers _awaitMatch function
```
        TFHE.optReq(TFHE.le(TFHE.asEuint8(EncreptedBall),6));
        
        Match storage Usermatch=matches[idx];
        require(Usermatch.players[1]!=address(0),"Player has Not Yet");
        TFHE.optReq(TFHE.not(Usermatch.isMatchFinished));
        if (Usermatch.players[0]==msg.sender){

            require(Usermatch.moves[0]==false,"you have already made a move");
            Usermatch.lastball[0]=TFHE.asEuint8(EncreptedBall);
            Usermatch.moves[0]=true;
        }
        else
            if (Usermatch.players[1]==msg.sender){
            require(Usermatch.moves[1]==false,"you have already made a move");
            Usermatch.lastball[1]=TFHE.asEuint8(EncreptedBall);
            Usermatch.moves[1]=true;
        }
        matches[idx]=Usermatch;
        if(Usermatch.moves[0]&&Usermatch.moves[1]){
            _awaitMatch(idx);
        }
```

****4._awaitMatch****

first we check the ball is out or not 

```
        ebool isout=TFHE.eq(Usermatch.lastball[0],Usermatch.lastball[1]); // check wehether player is out
        ebool is_not_out=TFHE.not(isout); // stores encrepted bool whether player is notout 
```

if player is out and next player should bat then we update currplayer
```
        ebool is_out_and_nextplayer=TFHE.and(isout,TFHE.le(Usermatch.currplayer,4)); // checks whether out and next player should bat 

        Usermatch.currplayer=TFHE.cmux(is_out_and_nextplayer,TFHE.add(Usermatch.currplayer,1),Usermatch.currplayer); // updates currplayer if is_out_and_nextplayer is true

```
if player is out and innings get completed we change all required details of match

```
        ebool is_out_and_nextinnigs=TFHE.and(isout,TFHE.eq(Usermatch.currplayer,5)); // checks whether player is out and next innings should begin

        ebool matchcompleted =TFHE.and(is_out_and_nextinnigs,Usermatch.isSecondinnings); // updated matchcompleted ebool
        Usermatch.isSecondinnings=TFHE.cmux(is_out_and_nextinnigs,TFHE.asEbool(true),Usermatch.isSecondinnings); // updates issecondinnings if last player is out and 
        

        Usermatch.isplayer1Turn=TFHE.cmux(is_out_and_nextinnigs,TFHE.not(Usermatch.isplayer1Turn),Usermatch.isplayer1Turn); // updates is player1 turn if innings changed
        Usermatch.currplayer=TFHE.cmux(is_out_and_nextinnigs,TFHE.asEuint8(0),Usermatch.currplayer); // updates currplayer if innings changed

```

if player is not out we updates the score of player

```
        ebool isplayer1Hit=TFHE.and(is_not_out,Usermatch.isplayer1Turn); // checks whether player1 hit the ball
        ebool isplayer2Hit=TFHE.and(is_not_out,TFHE.not(Usermatch.isplayer1Turn)); // checks whether player2 hit ball

        for(uint8 i=0;i<5;i++){
            // updates players score
        Usermatch.player1score[i]=TFHE.cmux(TFHE.and(isplayer1Hit,TFHE.eq(Usermatch.currplayer,i)),Usermatch.player1score[i]+Usermatch.lastball[0],Usermatch.player1score[i]);
        Usermatch.player2score[i]=TFHE.cmux(TFHE.and(isplayer2Hit,TFHE.eq(Usermatch.currplayer,i)),Usermatch.player2score[i]+Usermatch.lastball[1],Usermatch.player2score[i]);
        }
```

reset moves

` Usermatch.moves=[false,false];`

****5.Getwinner****

returns the winner of match only to the members of match 

 ```
        TFHE.optReq(matches[idx].isMatchFinished);
        Match memory Usermatch = matches[idx];  
        require(Usermatch.players[0]==msg.sender||Usermatch.players[1]==msg.sender,"you are not mmber of match");

        euint8 player1score=Usermatch.player1score[0]+Usermatch.player1score[1]+Usermatch.player1score[2]+Usermatch.player1score[3]+Usermatch.player1score[4];
        euint8 player2score=Usermatch.player2score[0]+Usermatch.player2score[1]+Usermatch.player2score[2]+Usermatch.player2score[3]+Usermatch.player2score[4];

        if(TFHE.decrypt(TFHE.gt(player1score,player2score))){
            return Usermatch.players[0];
        }
        else if (TFHE.decrypt(TFHE.lt(player1score,player2score))){
            return Usermatch.players[1];
        }
 ```


