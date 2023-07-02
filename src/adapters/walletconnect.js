module.exports = walletConnect = (provider) => {
    const network = provider.network;
    const projectId = provider.wcProjectId;
    const { EthereumProvider } = require('@walletconnect/ethereum-provider');

    const rpcIdMapping = {};
    rpcIdMapping[network.id] = network.rpcUrl;

    const connect = async () => {
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
                resolve(wallet);
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