// ===== Navigation =====
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

// ===== Wallet & Balances =====
let wallet = {
    address: null,
    balances: { AVODA: 1000, ETH: 2, USDT: 500 }
};

function updateWalletUI() {
    document.getElementById('walletAddress').innerText = wallet.address || "Not connected";
    const ul = document.getElementById('walletBalances');
    ul.innerHTML = '';
    for (let token in wallet.balances) {
        const li = document.createElement('li');
        li.innerText = `${token}: ${wallet.balances[token]}`;
        ul.appendChild(li);
    }
    updatePortfolioChart();
    updateTotalBalance();
}

function createWallet() {
    wallet.address = '0x' + Math.random().toString(16).slice(2, 12);
    alert('Wallet created: ' + wallet.address);
    updateWalletUI();
}

function importWallet() {
    const addr = prompt('Enter wallet address/mnemonic');
    if(addr) {
        wallet.address = addr;
        alert('Wallet imported: ' + wallet.address);
        updateWalletUI();
    }
}

function connectWallet() {
    wallet.address = '0x' + Math.random().toString(16).slice(2, 12);
    alert('Wallet connected: ' + wallet.address);
    updateWalletUI();
}

function copyAddress() {
    navigator.clipboard.writeText(wallet.address);
    alert('Address copied!');
}

// ===== Swap =====
document.getElementById('fromAmount').addEventListener('input', calculateSwap);
document.getElementById('fromToken').addEventListener('change', calculateSwap);
document.getElementById('toToken').addEventListener('change', calculateSwap);

function calculateSwap() {
    const fromToken = document.getElementById('fromToken').value;
    const toToken = document.getElementById('toToken').value;
    const fromAmount = parseFloat(document.getElementById('fromAmount').value) || 0;
    let rate = 1;
    // Mock exchange rates
    if(fromToken === 'AVODA' && toToken === 'ETH') rate = 0.001;
    if(fromToken === 'AVODA' && toToken === 'USDT') rate = 1.2;
    if(fromToken === 'ETH' && toToken === 'AVODA') rate = 1000;
    if(fromToken === 'USDT' && toToken === 'AVODA') rate = 0.83;
    if(fromToken === toToken) rate = 1;
    document.getElementById('toAmount').value = (fromAmount * rate).toFixed(4);
}

function swapTokens() {
    const fromToken = document.getElementById('fromToken').value;
    const toToken = document.getElementById('toToken').value;
    const fromAmount = parseFloat(document.getElementById('fromAmount').value);
    const toAmount = parseFloat(document.getElementById('toAmount').value);

    if(fromAmount <= 0 || fromAmount > wallet.balances[fromToken]) {
        alert('Invalid amount!');
        return;
    }

    wallet.balances[fromToken] -= fromAmount;
    wallet.balances[toToken] += toAmount;

    // Add transaction to mock table
    const txTable = document.querySelector('#transactionsTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `<td>${fromToken}→${toToken}</td><td>${fromAmount.toFixed(2)}→${toAmount.toFixed(2)}</td><td>Confirmed</td><td>${new Date().toLocaleDateString()}</td>`;
    txTable.prepend(row);

    alert('Swap executed!');
    updateWalletUI();
}

// ===== Portfolio Chart =====
const ctx = document.getElementById('portfolioChart').getContext('2d');
let portfolioChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: Object.keys(wallet.balances),
        datasets: [{ data: Object.values(wallet.balances), backgroundColor: ['#ff6384','#36a2eb','#ffcd56'] }]
    },
    options: { responsive: true }
});

function updatePortfolioChart() {
    portfolioChart.data.labels = Object.keys(wallet.balances);
    portfolioChart.data.datasets[0].data = Object.values(wallet.balances);
    portfolioChart.update();
}

function updateTotalBalance() {
    // Mock USD value calculation
    const total = wallet.balances.AVODA*1.2 + wallet.balances.ETH*2000 + wallet.balances.USDT;
    document.getElementById('totalBalance').innerText = total.toFixed(2);
}

// ===== AI Insights =====
const insightsList = document.getElementById('insightsList');
function updateInsights() {
    insightsList.innerHTML = `
    <li>Risk Alert: No suspicious tokens detected.</li>
    <li>Smart Swap Suggestion: AVODA → USDT for balanced portfolio.</li>
    <li>Liquidity Opportunity: Stake AVODA for rewards.</li>`;
}
updateInsights();

// ===== Theme Toggle =====
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if(document.body.classList.contains('dark')) {
        document.body.style.background = '#111';
        document.body.style.color = '#fff';
    } else {
        document.body.style.background = '#f2f2f2';
        document.body.style.color = '#111';
    }
});

function changeTheme(val) {
    if(val==='dark') document.body.style.background='#111', document.body.style.color='#fff';
    else document.body.style.background='#f2f2f2', document.body.style.color='#111';
}

// ===== Initialize UI =====
updateWalletUI();
