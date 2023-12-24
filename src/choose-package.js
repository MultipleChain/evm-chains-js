module.exports = (package) => {
    if (package === 'web3') {
        const Web3 = require('web3');
        return {
            Web3Provider: Web3,
            HttpProvider: Web3.providers.HttpProvider,
            WebsocketProvider: Web3.providers.WebsocketProvider,
        }
    } else {
        const ethers = require('ethers');
        return {
            Web3Provider: ethers.BrowserProvider,
            HttpProvider: ethers.JsonRpcProvider,
            WebsocketProvider: ethers.WebSocketProvider,
        }
    }
}