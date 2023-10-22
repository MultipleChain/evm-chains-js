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
        return new Promise(async (resolve, reject) => {
            web3Modal.connect()
            .then(async () => {
                resolve(await web3Modal.getWalletClient());
            }).catch((error) => {
                reject(error);
            });
        });
    }

    return {
        key: 'web3modal',
        name: 'Web3 Wallets',
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        removeOldConnection: web3Modal.removeOldConnection
    }
}