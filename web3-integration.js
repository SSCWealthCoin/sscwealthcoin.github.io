// -----------------------------------------------------
//  SSCWC — Web3 + Firebase Matchmaking Integration
//  Works fully on GitHub Pages
// -----------------------------------------------------

import { getDatabase, ref, set, get, child, onValue } 
  from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

// IMPORTANT — SAME FIREBASE CONFIG AS index.html
const firebaseConfig = {
  apiKey: "AIzaSyCiU4bLmbd5pJ6sv13TAMIk4eh8Exhid4o",
  authDomain: "sscwc-chess.firebaseapp.com",
  databaseURL: "https://sscwc-chess-default-rtdb.firebaseio.com",
  projectId: "sscwc-chess",
  storageBucket: "sscwc-chess.firebasestorage.app",
  messagingSenderId: "382398698085",
  appId: "1:382398698085:web:cc902f0f1b6b1b93602c8c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global Web3 Values
let provider;
let signer;
let userAddress = null;

// Token contract
const SSCWC_TOKEN = "0xd7deadbf768dec8ac13850e4f6787ac53a9d0447";

// -----------------------------------------------------
// Connect MetaMask
// -----------------------------------------------------
export async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found. Install MetaMask and try again.");
    return null;
  }

  provider = new ethers.BrowserProvider(window.ethereum);

  const accounts = await provider.send("eth_requestAccounts", []);
  userAddress = accounts[0];

  signer = await provider.getSigner();

  alert("Wallet connected:\n" + userAddress);
  return userAddress;
}

// -----------------------------------------------------
//  Check SSCWC token balance
// -----------------------------------------------------
export async function getSSCWC_Balance() {
  if (!signer) return 0;

  const abi = [
    "function balanceOf(address owner) view returns (uint256)"
  ];
  const token = new ethers.Contract(SSCWC_TOKEN, abi, signer);
  const bal = await token.balanceOf(userAddress);
  return Number(ethers.formatUnits(bal, 18));
}

// -----------------------------------------------------
//  Create Match (requires ≥ $1 SSCWC)
// -----------------------------------------------------
export async function createMatch(amountSSCWC = 1) {
  if (!userAddress) {
    alert("Connect your wallet first.");
    return;
  }

  const bal = await getSSCWC_Balance();
  if (bal < amountSSCWC) {
    alert("You need at least " + amountSSCWC + " SSCWC to create a match.");
    return;
  }

  const matchRef = ref(db, "matchmaking/" + userAddress);

  await set(matchRef, {
    host: userAddress,
    stake: amountSSCWC,
    status: "waiting",
    timestamp: Date.now()
  });

  alert("Match created! Waiting for opponent…");
}

// -----------------------------------------------------
//  Accept Match (join next waiting host)
// -----------------------------------------------------
export async function acceptMatch() {
  const snapshot = await get(child(ref(db), "matchmaking"));

  if (!snapshot.exists()) {
    alert("No active matches.");
    return;
  }

  const all = snapshot.val();

  let targetHost = null;

  for (const host in all) {
    if (all[host].status === "waiting") {
      targetHost = host;
      break;
    }
  }

  if (!targetHost) {
    alert("No available matches to join.");
    return;
  }

  const matchRef = ref(db, "matchmaking/" + targetHost);

  await set(matchRef, {
    host: targetHost,
    opponent: userAddress,
    stake: all[targetHost].stake,
    status: "matched",
    startTime: Date.now()
  });

  alert("Match accepted! Game can now begin.");
}

// -----------------------------------------------------
// Export for index.html
// -----------------------------------------------------
window.connectWallet = connectWallet;
window.createMatch = createMatch;
window.acceptMatch = acceptMatch;
window.getSSCWC_Balance = getSSCWC_Balance;
