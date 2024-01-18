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
    const Contract = new ethers.Contract(
      "0xA94fc4B4B05650B309E0379F2fA4a413d169828b",
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
    const publicKey = await provider.call({
      to: "0x0000000000000000000000000000000000000044",
    });
    await initFhevm();
    const Instance = await createInstance({ chainId, publicKey });
    setinstance(Instance);

    const generatedToken = Instance.generateToken({
      verifyingContract: contract.address,
    });
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
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
