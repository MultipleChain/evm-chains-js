module.exports = (provider) => {
    const network = provider.network;
    const projectId = provider.wcProjectId;
    const { EthereumProvider } = require('@walletconnect/ethereum-provider');

    const rpcIdMapping = {};
    rpcIdMapping[network.id] = network.rpcUrl;

    const connect = async () => {
        let wallet = await EthereumProvider.init({
            projectId,
            relayUrl: 'wss://relay.walletconnect.com',
            chains: [network.id],
            rpcMap: rpcIdMapping,
            showQrModal: true,
            qrModalOptions: {
                projectId,
                themeMode: provider.wcThemeMode,
                themeVariables: {
                    '--w3m-z-index': 999999999999,
                },
                explorerExcludedWalletIds: "ALL",
                explorerRecommendedWalletIds: [
                    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
                    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0"
                ],
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
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        removeOldConnection: () => {
            Object.keys(localStorage)
            .filter(x => x.startsWith('wc@2'))
            .forEach(x => localStorage.removeItem(x))
        },
    }
}