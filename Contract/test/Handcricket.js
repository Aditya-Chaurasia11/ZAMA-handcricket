const {expect} =require('chai')
const {  exec  } = require('child_process');
const { promisify } = require('util');
const execute = promisify(exec);
const { ethers } = require('ethers');

const hre = require("hardhat");


const fhevmjs =require('fhevmjs')

describe("Hand Cricket contract",function(){

    it("initalising Signers",async function(){


    const provider=new ethers.providers.JsonRpcProvider('http://localhost:8545/')

    this.alice=new ethers.Wallet.createRandom().connect(provider)
    this.bob=new ethers.Wallet.createRandom().connect(provider)

        const waitForBalance = async (address) => {
            return new Promise((resolve, reject) => {
              const checkBalance = async () => {
                const balance = Number(await provider.getBalance(address));
                if (balance > 0) {
                  await provider.off('block', checkBalance);
                  resolve();
                }
              };
               provider.on('block', checkBalance)
            });
          };
        
    if(Number(await provider.getBalance(this.alice.address))==0){
      await execute(`docker exec -i fhevm faucet ${this.alice.address}`)
      await waitForBalance(this.alice.address)
      console.log('funded alice');
    }
    if(Number(await provider.getBalance(this.bob.address))==0){
      await execute(`docker exec -i fhevm faucet ${this.bob.address}`)
      await waitForBalance(this.bob.address)
      console.log('funded Bob');
    }

    })

    it("deploying contract",async function(){

        const Handcricket = await hre.ethers.getContractFactory("multiHandCricketGame",this.alice);

         this.alicecontract = await Handcricket.deploy();


        this.bobcontract=await this.alicecontract.connect(this.bob)
    })

    it("setting up instance and token",async function(){

      const provider=new ethers.providers.JsonRpcProvider('http://localhost:8545/')

        const network = await provider.getNetwork();

        const chainId = Number(network.chainId)


        const publicKey = await provider.call({
            to: '0x0000000000000000000000000000000000000044',            
          });
          

         this.instance= await fhevmjs.createInstance({chainId,publicKey})
         this.alicetoken=this.instance.generateToken({verifyingContract: this.alicecontract.address})
         this.bobtoken=this.instance.generateToken({verifyingContract: this.bobcontract.address})
    })

    it("alice create Match with choosing head and bob will join",async function(){
        // true for head
        //false for tail

        const txalice= await this.alicecontract.createMatch(true,{gasLimit:3000000})
        await txalice.wait();

      const alicematchindex=await this.alicecontract.mapaddress(this.alice.address)

      expect(Number(alicematchindex)).to.equal(1)

        this.matchindex=1;

        const txbob=await this.bobcontract.joinMatch(1);
        await txbob.wait();
    })

    it("the batsman hits six",async function(){

      this.timeout(65000)
      
      const encreptedmatchdetails_before=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);

      this.isalicebatting_infirstinnings=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails_before[1])

      if(this.isalicebatting_infirstinnings){
        console.log("alice");
        const encreptedsix=this.instance.encrypt8(6)
        const txalice= await this.alicecontract.registerMove(this.matchindex,encreptedsix)
        await txalice.wait()
        
        const encreptedone=this.instance.encrypt8(1)
        const txbob= await this.bobcontract.registerMove(this.matchindex,encreptedone)
        await txbob.wait()

        
        const encreptedmatchdetails_after=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex)
        const player1score=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails_after[6][0])
        
        expect(Number(player1score)).to.equal(6)
      }else{
        console.log("bob");
        const encreptedsix=this.instance.encrypt8(6)
        const txbob= await this.bobcontract.registerMove(this.matchindex,encreptedsix)
        await txbob.wait()

        const encreptedone=this.instance.encrypt8(1)
        const txalice= await this.alicecontract.registerMove(this.matchindex,encreptedone)
        await txalice.wait()



        const encreptedmatchdetails_after=await this.bobcontract.getmatchesreEncrepted(this.bobtoken.publicKey,this.matchindex)
        const player1score=this.instance.decrypt(this.bobcontract.address,encreptedmatchdetails_after[7][0])

        expect(Number(player1score)).to.equal(6)
      }
    })

    it("the batsman's player1 gets out",async function(){
      this.timeout(65000)
      const encreptedtwo=this.instance.encrypt8(2)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedtwo)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedtwo)
      await txbob.wait();

      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const currentplayer=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[5])

      expect(Number(currentplayer)).to.equal(1)
    })
    it("the batsman's player2 gets out",async function(){
      this.timeout(65000)
      const encreptedthree=this.instance.encrypt8(3)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedthree)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedthree)
      await txbob.wait();

      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const currentplayer=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[5])

      expect(Number(currentplayer)).to.equal(2)
    })
    it("the batsman's player3 gets out",async function(){
      this.timeout(65000)
      const encreptedfour=this.instance.encrypt8(4)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedfour)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedfour)
      await txbob.wait();

      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const currentplayer=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[5])

      expect(Number(currentplayer)).to.equal(3)
    })
    it("the batsman's player4 gets out",async function(){
      this.timeout(65000)
      const encreptedsix=this.instance.encrypt8(6)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedsix)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedsix)
      await txbob.wait();

      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const currentplayer=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[5])

      expect(Number(currentplayer)).to.equal(4)
    })
    it("the batsman's player5 gets out and second innings starts",async function(){
      this.timeout(65000)
      const encreptedsix=this.instance.encrypt8(6)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedsix)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedsix)
      await txbob.wait();

      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const currentplayer=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[5])
      const issecondinnings=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[8])
      const isalicebating_insecondinnings=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[1])

      expect(Number(currentplayer)).to.equal(0)
      expect(Boolean(issecondinnings)).to.equal(true)
      expect(Boolean(isalicebating_insecondinnings)).to.equal(!this.isalicebatting_infirstinnings)
    })

    it("in second innings first player hits four  ",async function (){
      this.timeout(65000)
      const encreptedmatchdetails_before=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);

      this.isalicebatting_insecondinnings=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails_before[1])

      const encreptedfour=this.instance.encrypt8(4)
      const encreptedsix=this.instance.encrypt8(6)
      if(this.isalicebatting_insecondinnings){
        console.log("alice");
        const txalice= await this.alicecontract.registerMove(this.matchindex,encreptedfour)
        await txalice.wait()

        
        const txbob= await this.bobcontract.registerMove(this.matchindex,encreptedsix)
        await txbob.wait()
        
        
        const encreptedmatchdetails_after=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex)
        const player1score=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails_after[6][0])
        
        expect(Number(player1score)).to.equal(4)
      }else{
        console.log("bob");
        const txbob= await this.bobcontract.registerMove(this.matchindex,encreptedfour)
        await txbob.wait()


        const txalice= await this.alicecontract.registerMove(this.matchindex,encreptedsix)
        await txalice.wait()



        const encreptedmatchdetails_after=await this.bobcontract.getmatchesreEncrepted(this.bobtoken.publicKey,this.matchindex)
        const player1score=this.instance.decrypt(this.bobcontract.address,encreptedmatchdetails_after[7][0])

        expect(Number(player1score)).to.equal(4)
      }
    })

    it("the batsman's player1 gets out",async function(){
      this.timeout(65000)
      const encreptedtwo=this.instance.encrypt8(2)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedtwo)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedtwo)
      await txbob.wait();
      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const currentplayer=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[5])

      expect(Number(currentplayer)).to.equal(1)
    })
    it("the batsman's player2 gets out",async function(){
      this.timeout(65000)
      const encreptedthree=this.instance.encrypt8(3)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedthree)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedthree)
      await txbob.wait();

      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const currentplayer=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[5])

      expect(Number(currentplayer)).to.equal(2)
    })
    it("the batsman's player3 gets out",async function(){
      this.timeout(65000)
      const encreptedfour=this.instance.encrypt8(4)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedfour)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedfour)
      await txbob.wait();

      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const currentplayer=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[5])

      expect(Number(currentplayer)).to.equal(3)
    })
    it("the batsman's player4 gets out",async function(){
      this.timeout(65000)
      const encreptedsix=this.instance.encrypt8(6)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedsix)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedsix)
      await txbob.wait();

      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const currentplayer=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[5])

      expect(Number(currentplayer)).to.equal(4)
    })
    it("the batsman's player5 gets out and match ends",async function(){
      this.timeout(65000)
      const encreptedsix=this.instance.encrypt8(6)

      const txalice=await this.alicecontract.registerMove(this.matchindex,encreptedsix)
      await txalice.wait()

      const txbob =await  this.bobcontract.registerMove(this.matchindex,encreptedsix)
      await txbob.wait();

      

      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const ismatchcompleted=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[0])


      expect(Boolean(ismatchcompleted)).to.equal(true)

    })

    it("check match is ended and get winner",async function (){
      const encreptedmatchdetails=await this.alicecontract.getmatchesreEncrepted(this.alicetoken.publicKey,this.matchindex);
      const ismatchcompleted=this.instance.decrypt(this.alicecontract.address,encreptedmatchdetails[0])

      const winneraddress=this.alicecontract.getwinner(this.matchindex);

      console.log('winner is :'+winneraddress);
      expect(Boolean(ismatchcompleted)).to.equal(true)
      

    })


    



    

})