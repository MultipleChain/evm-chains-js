module.exports = walletConnect = (provider) => {
    const network = provider.network;
    const infuraId = provider.infuraId;
    const WalletConnectProvider = require('@walletconnect/web3-provider').default;

    // function isLocalHost() {
    //     return location.hostname === "localhost" || location.hostname === "127.0.0.1";
    // }

    // function checkNetwork(network) {
    //     if (isLocalHost() && network.hexId == "0x61") {
    //         return false;
    //     }
    //     return true;
    // }
    // Object.values(networks).forEach((network) => {
    //     if (!checkNetwork(network)) return;
    //     rpcIdMapping[network.id] = network.rpcUrl;
    // });

    const rpcIdMapping = {};
    rpcIdMapping[network.id] = network.rpcUrl;

    const wallet =  new WalletConnectProvider({
        infuraId,
        rpc: rpcIdMapping,
        qrcodeModalOptions: {
            mobileLinks: [
                "metamask",
                "trust",
                //"rainbow",
                //"argent",
                //"imtoken",
                //"pillar",
            ],
            desktopLinks: []
        }
    });
    
    wallet.on('disconnect', () => {
        localStorage.removeItem('walletconnect');
    });

    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            wallet.enable()
            .then((accounts) => {
                resolve(accounts[0]);
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
        wallet,
        connect
    }
}