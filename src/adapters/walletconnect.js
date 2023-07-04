const removeConnection = () => {
    Object.keys(localStorage)
    .filter(x => x.startsWith('wc@2'))
    .forEach(x => localStorage.removeItem(x))
}

module.exports = walletConnect = (provider) => {
    const network = provider.network;
    const projectId = provider.wcProjectId;
    const { EthereumProvider } = require('@walletconnect/ethereum-provider');

    const rpcIdMapping = {};
    rpcIdMapping[network.id] = network.rpcUrl;

    const connect = async () => {
        removeConnection();
        let wallet = await EthereumProvider.init({
            projectId,
            chains: [network.id],
            rpcMap: rpcIdMapping,
            showQrModal: true,
            qrModalOptions: {
                projectId,
                explorerExcludedWalletIds: "ALL",
                explorerRecommendedWalletIds: "NONE",
            }
        });
        return new Promise(async (resolve, reject) => {
            wallet.enable()
            .then(() => {
                setTimeout(() => {
                    resolve(wallet);
                }, 4000);
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    return {
        key: 'walletconnect',
        name: 'WalletConnect',
        type: 'qr',
        connect
    }
}