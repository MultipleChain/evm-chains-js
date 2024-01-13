module.exports = (wallet, provider) => {
    const network = provider.network;
    const networks = provider.networks;
    
    if (!network) {
        return new Promise(async (resolve) => {
            resolve(true);
        });
    }

    const {hex} = require('../utils.js');

    const request = async (params) => {
        let res = await wallet.request(params);
        if (res && res.error) {
            if (res.error.code == -32000) {
                throw new Error('rpc-timeout');
            }
            throw new Error(res.error.message);
            
        }
        return res;
    }

    const addNetwork = (network) => {
        return new Promise(async (resolve, reject) => {
            try {
                network = networks.find(n => n.id == network.id);
                let chainId = network.hexId || hex(network.id);
                request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId,
                        chainName: network.name,
                        rpcUrls: [network.rpcUrl],
                        nativeCurrency: network.nativeCurrency,
                        blockExplorerUrls: [network.explorerUrl]
                    }],
                })
                .then(() => {
                    resolve(true);
                })
                .catch((error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    const changeNetwork = (network) => {
        network = JSON.parse(JSON.stringify(network));
        return new Promise(async (resolve, reject) => {
            let chainId = network.hexId || hex(network.id);
            request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            })
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                if (
                    error.code === 4902 ||
                    String(error.message).indexOf('wallet_addEthereumChain') > -1    
                ) {
                    addNetwork(network)
                    .then(() => {
                        resolve(true);
                    })
                    .catch((error) => {
                        reject(error);
                    });
                } else {
                    reject(error);
                }
            });
        });
    }

    const getChainId = async () => {
        return parseInt((await request({method: 'eth_chainId'})), 16);
    }

    const maybeSwitch = () => {
        return new Promise(async (resolve, reject) => {
            try {
                if (await getChainId() != network.id) {
                    changeNetwork(network)
                    .then(() => {
                        resolve(true);
                    })
                    .catch((error) => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    return maybeSwitch(wallet, provider);
}