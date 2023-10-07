module.exports = (wallet, provider) => {
    const network = provider.network;
    const {isNumeric, hex} = require('../utils.js');

    this.addNetwork = (network) => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: network.hexId,
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

    this.changeNetwork = (network) => {
        network = JSON.parse(JSON.stringify(network));
        return new Promise(async (resolve, reject) => {
            wallet.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: network.hexId }],
            })
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                if (
                    error.code === 4902 ||
                    String(error.message).indexOf('wallet_addEthereumChain') > -1    
                ) {
                    this.addNetwork(network)
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

    this.getChainHexId = async () => {
        let id = await wallet.request({method: 'eth_chainId'});
        if (isNumeric(id)) return hex(id);
        return id;
    }

    this.maybeSwitch = () => {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.getChainHexId() != network.hexId) {
                    this.changeNetwork(network)
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

    return this.maybeSwitch(wallet, provider);
}