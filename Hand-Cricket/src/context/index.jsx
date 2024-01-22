import { ethers } from "ethers";
import { createInstance, initFhevm } from "fhevmjs";
import abi from "../abi.json";
import { createContext, useContext, useEffect, useState } from "react";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setcontract] = useState();
  const [signer, setsigner] = useState();
  const [instance, setinstance] = useState();
  const [publicK, setPublic] = useState([]);
  const [signature,setsignature]=useState();

  const getAddress = async () => {
    const accounts = await window?.ethereum?.request({
      method: "eth_requestAccounts",
    });
    setWalletAddress(accounts[0]);

    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    window?.ethereum?.on("chainChanged", () => {
      window.location.reload();
    });
    window?.ethereum?.on("accountsChanged", () => {
      window.location.reload();
    });

    if (chainId !== "0x1F49") {
      await window?.ethereum
        ?.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: "0x1F49",
            },
          ],
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  useEffect(() => {
    getAddress();
  }, [walletAddress]);

  const getcontract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const Signer = await provider.getSigner();
    setsigner(Signer);
    // console.log(Signer);
    const Contract = new ethers.Contract(
      "0xf4C2851599493823CDDB874F4F78A3E5994d1c78",
      abi,
      Signer 
    );
    setcontract(Contract);
  };
  useEffect(() => {
    getcontract();
  }, []);

  const getInstance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();

    const ret = await provider.call({
      // fhe lib address, may need to be changed depending on network
      to: "0x000000000000000000000000000000000000005d",
      // first four bytes of keccak256('fhePubKey(bytes1)') + 1 byte for library
      data: "0xd9d47bb001",
    });
    
    const abiCoder = new ethers.utils.AbiCoder();
    const decoded = abiCoder.decode(['bytes'], ret);
    
    const publicKey = decoded[0];
    
    console.log(publicKey);

    await initFhevm();
    console.log(publicKey);
    // console.log(chainId);
    const Instance = await createInstance({ chainId, publicKey });
    setinstance(Instance);

    const generatedToken = Instance.generateToken({
      name: "Authorization token",
      verifyingContract: contract.address,
    });
    const accounts = await window?.ethereum?.request({
      method: "eth_requestAccounts",
    });
    console.log(accounts[0]);
    const params = [accounts[0], JSON.stringify(generatedToken.token)];
    const sign =  await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params,
      });

    setsignature(sign)

    setPublic(generatedToken.publicKey);
    
  };

  useEffect(() => {
    contract && getInstance();
  }, [contract]);

  return (
    <GlobalContext.Provider
      value={{
        walletAddress,
        signer,
        contract,
        instance,
        publicK,
        signature
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
