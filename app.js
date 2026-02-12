// --- Bridge Configuration ---
const RELAY_FEE_PERCENT = 0.001; // 0.1% bridge fee

function calculateBridgeFee() {
    const input = document.getElementById('bridgeInput').value;
    const output = document.getElementById('bridgeOutput');
    const feeDisplay = document.getElementById('bridge-fee');

    if (input > 0) {
        const fee = input * RELAY_FEE_PERCENT;
        const gasEstimate = 0.005; // Simulated ETH gas for bridge contract call
        const finalOutput = input - fee - gasEstimate;
        
        output.value = finalOutput > 0 ? finalOutput.toFixed(4) : "0.00";
        feeDisplay.innerText = `$${(fee * 2500).toFixed(2)}`; // Convert fee to USD for display
    }
}

async function initiateBridge() {
    const amount = document.getElementById('bridgeInput').value;
    if (!amount || amount <= 0) return alert("Enter amount to bridge");

    const progressBox = document.getElementById('bridge-progress');
    const bar = document.getElementById('progress-bar');
    const status = document.getElementById('progress-status');
    const step = document.getElementById('progress-step');

    progressBox.style.display = 'block';
    
    // Step 1: Lock Assets
    status.innerText = "Locking Assets on ETH...";
    step.innerText = "Waiting for MetaMask approval...";
    bar.style.width = "33%";
    await new Promise(r => setTimeout(r, 2000));

    // Step 2: Relayer Validation
    status.innerText = "Relayer Validating...";
    step.innerText = "Verifying transaction hash on AVODA Nodes...";
    bar.style.width = "66%";
    await new Promise(r => setTimeout(r, 3000));

    // Step 3: Minting
    status.innerText = "Minting on AVODA...";
    step.innerText = "Successfully minted wrapped assets to your wallet.";
    bar.style.width = "100%";
    
    setTimeout(() => {
        alert(`Bridge Complete! ${amount} Assets migrated to AVODA Chain.`);
        progressBox.style.display = 'none';
        bar.style.width = "0%";
    }, 1500);
}
