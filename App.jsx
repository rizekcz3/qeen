
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const PRESALE_CONTRACT = "0x186288D8028A1CB7dDB9cDd7e991196C7922C521";
const USDT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];
const PRESALE_ABI = ["function buy(uint256 usdtAmount)"];

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [txHash, setTxHash] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask není nainstalován");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setWallet({ provider, address: accounts[0] });
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet) return;
      const signer = await wallet.provider.getSigner();
      const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const bal = await usdt.balanceOf(wallet.address);
      setUsdtBalance(ethers.formatUnits(bal, 18));
    };
    fetchBalance();
  }, [wallet]);

  const handleBuy = async () => {
    if (!wallet || !amount) return;
    const signer = await wallet.provider.getSigner();
    const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
    const presale = new ethers.Contract(PRESALE_CONTRACT, PRESALE_ABI, signer);

    const parsed = ethers.parseUnits(amount.toString(), 18);
    const tx1 = await usdt.approve(PRESALE_CONTRACT, parsed);
    await tx1.wait();
    const tx2 = await presale.buy(parsed);
    await tx2.wait();
    setTxHash(tx2.hash);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>DeFiChess Presale</h1>
      {!wallet ? (
        <button onClick={connectWallet}>Připojit MetaMask</button>
      ) : (
        <>
          <p>USDT Balance: {parseFloat(usdtBalance).toFixed(2)}</p>
          <input
            type="number"
            placeholder="Zadej částku v USDT"
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleBuy}>Koupit tokeny</button>
          {txHash && (
            <p>
              Transakce:{" "}
              <a href={`https://bscscan.com/tx/${txHash}`} target="_blank">
                {txHash}
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}
