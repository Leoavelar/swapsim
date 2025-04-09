import { useState, useEffect } from 'react';

// Font configuration
const FONT_FAMILY = "Montserrat"; // Easy to change - just edit this constant
const FONT_URL = `https://fonts.googleapis.com/css2?family=${FONT_FAMILY}:wght@400;500;600;700&display=swap`;

const SwapSimulator = () => {
  // Add custom CSS for font
  useEffect(() => {
    // Create a link element for Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = FONT_URL;
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Add font-family to the root element
    document.documentElement.style.fontFamily = `'${FONT_FAMILY}', sans-serif`;

    // Remove default margins and padding from body and html
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.width = '100%';
    document.body.style.height = '100vh';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100vh';
    document.body.style.overflow = 'hidden';

    // Clean up on component unmount
    return () => {
      document.head.removeChild(fontLink);
      document.documentElement.style.fontFamily = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Token state
  const [token1Balance, setToken1Balance] = useState(1000);
  const [token2Balance, setToken2Balance] = useState(1000);
  const [k, setK] = useState(token1Balance * token2Balance);

  // Token names
  const [token1Name, setToken1Name] = useState("TOKEN");
  const [token2Name, setToken2Name] = useState("USDT");

  // User balances
  const [userToken1, setUserToken1] = useState(10000);
  const [userToken2, setUserToken2] = useState(10000);

  // Input states
  const [inputAmount, setInputAmount] = useState("");
  const [selectedInputToken, setSelectedInputToken] = useState(1);
  const [expectedOutput, setExpectedOutput] = useState(0);
  const [slippage, setSlippage] = useState(0);
  const [priceImpact, setPriceImpact] = useState(0);

  // Price history
  const [priceHistory, setPriceHistory] = useState([
    { token1Price: 1, token2Price: 1 }
  ]);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Logo URL - using the logo from public folder
  const [logoUrl, setLogoUrl] = useState("/swapsim.png");

  // Calculate expected output and price impact whenever input changes
  useEffect(() => {
    if (inputAmount && !isNaN(parseFloat(inputAmount)) && parseFloat(inputAmount) > 0) {
      const amount = parseFloat(inputAmount);
      let output = 0;
      let newSlippage = 0;
      let newPriceImpact = 0;

      if (selectedInputToken === 1) {
        // Token1 to Token2 swap calculation
        const newToken1Balance = token1Balance + amount;
        const newToken2Balance = k / newToken1Balance;
        output = token2Balance - newToken2Balance;

        // Calculate price impact
        const initialPrice = token2Balance / token1Balance;
        const finalPrice = newToken2Balance / newToken1Balance;
        newPriceImpact = Math.abs((finalPrice - initialPrice) / initialPrice) * 100;
      } else {
        // Token2 to Token1 swap calculation
        const newToken2Balance = token2Balance + amount;
        const newToken1Balance = k / newToken2Balance;
        output = token1Balance - newToken1Balance;

        // Calculate price impact
        const initialPrice = token1Balance / token2Balance;
        const finalPrice = newToken1Balance / newToken2Balance;
        newPriceImpact = Math.abs((finalPrice - initialPrice) / initialPrice) * 100;
      }

      // Limit to 6 decimal places for display
      setExpectedOutput(Math.max(0, parseFloat(output.toFixed(6))));
      setPriceImpact(parseFloat(newPriceImpact.toFixed(2)));

      // Calculate slippage (simplified for educational purposes)
      setSlippage(parseFloat((newPriceImpact * 0.5).toFixed(2)));
    } else {
      setExpectedOutput(0);
      setPriceImpact(0);
      setSlippage(0);
    }
  }, [inputAmount, selectedInputToken, token1Balance, token2Balance, k]);

  // Execute the swap
  const handleSwap = () => {
    if (!inputAmount || isNaN(parseFloat(inputAmount)) || parseFloat(inputAmount) <= 0) {
      return;
    }

    const amount = parseFloat(inputAmount);

    if (selectedInputToken === 1) {
      // Check if user has enough tokens
      if (amount > userToken1) {
        alert("Insufficient balance");
        return;
      }

      // Update pool balances
      const newToken1Balance = token1Balance + amount;
      const newToken2Balance = k / newToken1Balance;
      const outputAmount = token2Balance - newToken2Balance;

      // Calculate new prices
      const newToken1Price = newToken2Balance / newToken1Balance;
      const newToken2Price = newToken1Balance / newToken2Balance;

      // Update price history
      setPriceHistory(prev => [...prev, {
        token1Price: newToken1Price,
        token2Price: newToken2Price
      }]);

      // Update states
      setToken1Balance(newToken1Balance);
      setToken2Balance(newToken2Balance);
      setUserToken1(prev => prev - amount);
      setUserToken2(prev => prev + outputAmount);
    } else {
      // Check if user has enough tokens
      if (amount > userToken2) {
        alert("Insufficient balance");
        return;
      }

      // Update pool balances
      const newToken2Balance = token2Balance + amount;
      const newToken1Balance = k / newToken2Balance;
      const outputAmount = token1Balance - newToken1Balance;

      // Calculate new prices
      const newToken1Price = newToken2Balance / newToken1Balance;
      const newToken2Price = newToken1Balance / newToken2Balance;

      // Update price history
      setPriceHistory(prev => [...prev, {
        token1Price: newToken1Price,
        token2Price: newToken2Price
      }]);

      // Update states
      setToken1Balance(newToken1Balance);
      setToken2Balance(newToken2Balance);
      setUserToken2(prev => prev - amount);
      setUserToken1(prev => prev + outputAmount);
    }

    // Reset input
    setInputAmount("");
    setExpectedOutput(0);
  };

  // Swap input token
  const handleSwitchTokens = () => {
    setSelectedInputToken(selectedInputToken === 1 ? 2 : 1);
    setInputAmount("");
    setExpectedOutput(0);
  };

  // Reset the simulation
  const resetSimulation = () => {
    setToken1Balance(1000);
    setToken2Balance(1000);
    setK(1000 * 1000);
    setUserToken1(10000);
    setUserToken2(10000);
    setInputAmount("");
    setExpectedOutput(0);
    setPriceImpact(0);
    setSlippage(0);
    setPriceHistory([{ token1Price: 1, token2Price: 1 }]);
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Calculated current prices
  const token1Price = token2Balance / token1Balance;
  const token2Price = token1Balance / token2Balance;

  // Custom gradient background styles
  const gradientBgStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    opacity: 0.8,
    background: isDarkMode
      ? 'radial-gradient(circle at 10% 20%, rgba(21, 65, 148, 0.15) 0%, rgba(49, 31, 94, 0.15) 100.2%)'
      : 'radial-gradient(circle at 10% 20%, rgba(142, 197, 252, 0.2) 0%, rgba(224, 195, 252, 0.2) 100.2%)',
  };

  // Glow effect for primary elements
  const primaryGlow = {
    boxShadow: isDarkMode
      ? '0 0 40px rgba(66, 153, 225, 0.15)'
      : '0 0 30px rgba(49, 130, 206, 0.15)',
  };

  // Secondary glow for contrast elements
  const secondaryGlow = {
    boxShadow: isDarkMode
      ? '0 0 30px rgba(183, 148, 244, 0.15)'
      : '0 0 20px rgba(159, 122, 234, 0.15)',
  };

  // Token color configurations
  const token1Color = isDarkMode ? 'bg-blue-600' : 'bg-blue-500';
  const token2Color = isDarkMode ? 'bg-purple-600' : 'bg-purple-500';

  return (
    <div className={`fixed inset-0 w-full h-full overflow-auto ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`} style={{ margin: 0, padding: 0 }}>
      {/* Gradient background effect */}
      <div style={gradientBgStyle}></div>

      {/* Animated glow orbs */}
      <div className="hidden md:block absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 bg-blue-400 blur-3xl animate-pulse duration-400"
           style={{transform: 'translate(30%, -30%)'}}></div>
      <div className="hidden md:block absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 bg-purple-400 blur-3xl animate-pulse"
           style={{transform: 'translate(-30%, 30%)', animationDelay: '1s'}}></div>

      <div className="mx-auto p-4 relative w-full md:max-w-lg">

        {/* Header with Logo */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {/* Logo - using your custom logo */}
            <div className="mr-3 w-32 h-10 flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-32 h-32" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
              )}
            </div>
            {/*<h1 className="text-xl font-bold">Leonardo's SWAP Simulator</h1>*/}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={resetSimulation}
              className={`px-3 py-1 rounded-md transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-200'}`}
            >
              Reset
            </button>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1 rounded-md transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-200'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Token Configuration */}
        <div className={`p-3 rounded-lg mb-4 transition-all ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90 shadow'}`} style={primaryGlow}>
          <h2 className="text-lg font-semibold mb-2">Token Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm opacity-75 mb-1">Token 1 Name</label>
              <input
                type="text"
                value={token1Name}
                onChange={(e) => setToken1Name(e.target.value)}
                className={`w-full p-2 rounded-md transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                placeholder="Token 1 Name"
              />
            </div>
            <div>
              <label className="block text-sm opacity-75 mb-1">Token 2 Name</label>
              <input
                type="text"
                value={token2Name}
                onChange={(e) => setToken2Name(e.target.value)}
                className={`w-full p-2 rounded-md transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                placeholder="Token 2 Name"
              />
            </div>
          </div>
        </div>

        {/* Price Display */}
        <div className={`p-3 rounded-lg mb-4 transition-all ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90 shadow'}`}>
          <h2 className="text-lg font-semibold mb-2">Current Prices</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg transition-all ${isDarkMode ? 'bg-blue-900/60' : 'bg-blue-100'}`} style={secondaryGlow}>
              <div className="text-sm opacity-75">1 {token1Name} =</div>
              <div className="text-xl font-bold">{token1Price.toFixed(6)} {token2Name}</div>
              {priceHistory.length > 1 && (
                <div className={`text-sm mt-1 ${
                  token1Price > priceHistory[priceHistory.length - 2].token1Price
                    ? 'text-green-500'
                    : token1Price < priceHistory[priceHistory.length - 2].token1Price
                      ? 'text-red-500'
                      : ''
                }`}>
                  {token1Price > priceHistory[priceHistory.length - 2].token1Price
                    ? '↑ '
                    : token1Price < priceHistory[priceHistory.length - 2].token1Price
                      ? '↓ '
                      : ''}
                  {Math.abs((token1Price / priceHistory[priceHistory.length - 2].token1Price - 1) * 100).toFixed(2)}%
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg transition-all ${isDarkMode ? 'bg-purple-900/60' : 'bg-purple-100'}`} style={secondaryGlow}>
              <div className="text-sm opacity-75">1 {token2Name} =</div>
              <div className="text-xl font-bold">{token2Price.toFixed(6)} {token1Name}</div>
              {priceHistory.length > 1 && (
                <div className={`text-sm mt-1 ${
                  token2Price > priceHistory[priceHistory.length - 2].token2Price
                    ? 'text-green-500'
                    : token2Price < priceHistory[priceHistory.length - 2].token2Price
                      ? 'text-red-500'
                      : ''
                }`}>
                  {token2Price > priceHistory[priceHistory.length - 2].token2Price
                    ? '↑ '
                    : token2Price < priceHistory[priceHistory.length - 2].token2Price
                      ? '↓ '
                      : ''}
                  {Math.abs((token2Price / priceHistory[priceHistory.length - 2].token2Price - 1) * 100).toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swap Form */}
        <div className={`p-3 rounded-lg mb-4 transition-all ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90 shadow'}`} style={primaryGlow}>
          <h2 className="text-lg font-semibold mb-4">Swap Tokens</h2>

          {/* Input */}
          <div className={`p-3 rounded-lg mb-2 transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex justify-between mb-1">
              <span className="text-sm opacity-75">You pay</span>
              <span className="text-sm opacity-75">
                Balance: {selectedInputToken === 1 ? userToken1.toFixed(2) : userToken2.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.0"
                className={`w-full bg-transparent outline-none text-lg`}
              />
              <button
                onClick={handleSwitchTokens}
                className={`flex items-center space-x-1 ml-2 px-3 py-1 rounded-md transition-all ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedInputToken === 1 ? token1Color : token2Color
                }`}>
                  {selectedInputToken === 1 ? token1Name.substring(0, 1) : token2Name.substring(0, 1)}
                </div>
                <span>{selectedInputToken === 1 ? token1Name : token2Name}</span>
              </button>
            </div>
          </div>

          {/* Switch Arrow */}
          <div className="flex justify-center my-2">
            <div className={`p-1 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Output */}
          <div className={`p-3 rounded-lg mb-4 transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex justify-between mb-1">
              <span className="text-sm opacity-75">You receive</span>
            </div>
            <div className="flex items-center">
              <div className="w-full text-lg">
                {expectedOutput > 0 ? expectedOutput.toFixed(6) : '0.0'}
              </div>
              <div className={`flex items-center space-x-1 ml-2 px-3 py-1 rounded-md ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedInputToken !== 1 ? token1Color : token2Color
                }`}>
                  {selectedInputToken !== 1 ? token1Name.substring(0, 1) : token2Name.substring(0, 1)}
                </div>
                <span>{selectedInputToken !== 1 ? token1Name : token2Name}</span>
              </div>
            </div>
          </div>

          {/* Swap Info */}
          {expectedOutput > 0 && (
            <div className={`p-3 rounded-lg mb-4 text-sm transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between mb-1">
                <span>Price</span>
                <span>
                  {selectedInputToken === 1
                    ? `1 ${token1Name} = ${token1Price.toFixed(6)} ${token2Name}`
                    : `1 ${token2Name} = ${token2Price.toFixed(6)} ${token1Name}`}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Price Impact</span>
                <span className={priceImpact > 5 ? 'text-red-500' : priceImpact > 2 ? 'text-yellow-500' : 'text-green-500'}>
                  {priceImpact}%
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!inputAmount || parseFloat(inputAmount) <= 0 || expectedOutput <= 0}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              !inputAmount || parseFloat(inputAmount) <= 0 || expectedOutput <= 0
                ? (isDarkMode ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed')
                : (isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90')
            }`}
          >
            {!inputAmount || parseFloat(inputAmount) <= 0
              ? 'Enter an amount'
              : (selectedInputToken === 1 && parseFloat(inputAmount) > userToken1) ||
              (selectedInputToken === 2 && parseFloat(inputAmount) > userToken2)
                ? 'Insufficient balance'
                : 'Swap'}
          </button>
        </div>

        {/* Liquidity Pool Info */}
        <div className={`p-3 rounded-lg mb-4 transition-all ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90 shadow'}`}>
          <h2 className="text-lg font-semibold mb-2">Liquidity Pool</h2>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${token1Color}`}>
                {token1Name.substring(0, 1)}
              </div>
              <span>{token1Balance.toFixed(2)} {token1Name}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${token2Color}`}>
                {token2Name.substring(0, 1)}
              </div>
              <span>{token2Balance.toFixed(2)} {token2Name}</span>
            </div>
          </div>
          <div className="text-sm opacity-75">
            Constant k = {k.toFixed(2)}
          </div>
        </div>

        {/* User Balance */}
        <div className={`p-3 rounded-lg mb-4 transition-all ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90 shadow'}`}>
          <h2 className="text-lg font-semibold mb-2">Your Balance</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${token1Color}`}>
                {token1Name.substring(0, 1)}
              </div>
              <span>{userToken1.toFixed(2)} {token1Name}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${token2Color}`}>
                {token2Name.substring(0, 1)}
              </div>
              <span>{userToken2.toFixed(2)} {token2Name}</span>
            </div>
          </div>
        </div>



        {/* Price Impact Explanation */}
        <div className={`p-3 rounded-lg mb-4 transition-all ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90 shadow'}`}>
          <h2 className="text-lg font-semibold mb-2">Price Impact Visualization</h2>
          <div className="text-sm opacity-80 mb-3">
            When you swap tokens, you change the ratio of tokens in the pool, which affects their price.
          </div>

          {priceHistory.length > 1 && (
            <div className={`p-3 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="font-medium mb-1">Price History</h3>
              <div className="space-y-1">
                {priceHistory.slice(-5).map((price, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>Swap #{priceHistory.length - 5 + i}</span>
                    <span>1 {token1Name} = {price.token1Price.toFixed(6)} {token2Name}</span>
                  </div>
                )).reverse()}
              </div>
            </div>
          )}
        </div>

        {/* Educational Notes */}
        <div className={`p-3 rounded-lg text-sm mb-4 transition-all ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/90 shadow'}`}>
          <h2 className="text-md font-semibold mb-2">How It Works</h2>
          <ul className="space-y-2 opacity-80">
            <li>• This simulator demonstrates the <b>constant product formula</b>: x × y = k</li>
            <li>• As one token's supply increases, the other decreases to maintain k</li>
            <li>• Larger trades cause higher price impact and slippage</li>
            <li>• The token price is the ratio of one token to another in the pool</li>
            <li>• This is a simplified version of how decentralized exchanges function</li>
          </ul>
        </div>

        {/* Footer with attribution */}
        <div className="text-center text-sm opacity-60 mb-4">
          Designed for educational purposes by Leonardo Avelar
        </div>
      </div>
    </div>
  );
};

export default SwapSimulator;