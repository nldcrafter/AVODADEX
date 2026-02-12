/**
 * AVODA.AI - Core Logic Layer
 * Handles: Web3 Connections, Real-time Price Feeds, and DEX Math
 */

// --- Configuration ---
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const TOKENS = {
    eth: "ethereum",
    avoda: "avoda" // Note: Use 'bitcoin' or 'binancecoin' to test real data until AVODA is live
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("AVODA Engine Started...");
    startPriceListener();
});

/**
 * FETCH REAL-TIME PRICES
 * Connects to CoinGecko API to get live USD rates
 */
async function getLivePrice(coinId) {
    try {
        const response = await fetch(`${COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=usd`);
        const data = await response.json();
        return data[coinId].usd;
    } catch (error) {
        console.error("Price Feed Error:", error);
        return null;
    }
}

/**
 * DEX CALCULATION LOGIC
 * Updates the "You Get" field based on live market data
 */
async function calculateSwap() {
    const inputAmt = document.getElementById('inputAmt').value;
    const outputField = document.getElementById('outputAmt');
    
    if (!inputAmt || inputAmt <= 0) {
        outputField.value = "";
        return;
    }

    // Logic: Fetch ETH price and AVODA price (Simulating AVODA at $0.50 for now)
    const ethPrice = await getLivePrice(TOKENS.eth);
    const avodaPrice = 0.50; // Replace with live price once token is listed

    if (ethPrice) {
        const totalUsdValue = inputAmt * ethPrice;
        const estimatedTokens = totalUsdValue / avodaPrice;
        
        // Apply 0.3% simulated DEX fee
        const finalAmount = estimatedTokens * 0.997;
        
        outputField.value = finalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
}

/**
 * WEB3 TRANSACTION (PLACEHOLDER)
 * This is where you connect to Ethers.js to sign the transaction
 */
async function executeSwap() {
    const btn = document.querySelector('.btn-action');
    const originalText = btn.innerText;

    // 1. Check if wallet is connected
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    // 2. Visual Feedback
    btn.innerText = "Confirming on Chain...";
    btn.style.opacity = "0.7";

    try {
        // Here you would use: await contract.swap(amount)
        // For now, we simulate a 2-second blockchain delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert("Successfully Swapped! Transaction Hash: 0x" + Math.random().toString(16).slice(2));
    } catch (err) {
        alert("Transaction Failed: " + err.message);
    } finally {
        btn.innerText = originalText;
        btn.style.opacity = "1";
    }
}

/**
 * UI EVENT LISTENERS
 */
function startPriceListener() {
    const input = document.getElementById('inputAmt');
    if (input) {
        // Debounce: Wait for user to stop typing before fetching price
        let timeout = null;
        input.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(calculateSwap, 500);
        });
    }
}
