const Web3Modal = require('@multiplechain/web3modal');

module.exports = (provider) => {
    const network = provider.network;
    const projectId = provider.wcProjectId;
    const themeMode = provider.wcThemeMode;

    const web3Modal = new Web3Modal({
        projectId,
        network,
        themeMode
    });

    const connect = async () => {
        await web3Modal.connect();
        return await web3Modal.getWalletClient();
    }

    return {
        key: 'web3modal',
        name: 'Web3Modal',
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        removeOldConnection: web3Modal.removeOldConnection
    }
}