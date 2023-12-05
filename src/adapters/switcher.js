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

    this.addNetwork = (network) => {
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

    this.changeNetwork = (network) => {
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
        let id = await request({method: 'eth_chainId'});
        if (id == '0x01') return '0x1';
        if (!String(id).startsWith('0x')) return '0x' + id.toString(16);
        return id;
    }

    this.maybeSwitch = () => {
        return new Promise(async (resolve, reject) => {
            try {
                let chainId = network.hexId || hex(network.id);
                if (await this.getChainHexId() != chainId) {
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