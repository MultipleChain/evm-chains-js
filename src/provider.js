const Web3 = require('web3');
const utils = require('./utils');
const Coin = require('./entity/coin');
const Token = require('./entity/token');
const Contract = require('./entity/token');
const Transaction = require('./entity/transaction');

class Provider {

    web3;

    methods;

    testnet = false;

    infuraId = null;

    network = null;

    detectedWallets = {};

    connectedWallet = null;

    /**
     * @param {Object} network 
     * @param {Boolean} testnet 
     * @param {String} infuraId 
     */
    constructor(network, testnet = false, infuraId = null) {

        this.testnet = testnet;
        this.infuraId = infuraId;

        let networks = require('@multiplechain/evm-based-chains');
        networks = testnet ? networks.testnets : networks.mainnets;

        if (typeof network == 'object') {
            this.network = network;
        } else if (networks[network]) {
            this.network = networks[network];
        } else {
            throw new Error('Network not found!');
        }

        if (typeof window == 'undefined') {
            this.setWeb3(new Web3(new Web3.providers.HttpProvider(this.network.rpcUrl)));
        }

        this.detectWallets();
    }

    /**
     * @param {Web3} web3 
     */
    setWeb3(web3) {
        this.web3 = web3;
        if (!window) {
            this.methods = web3.eth;
        } else {
            let Methods = require('./methods');
            this.methods = new Methods(web3);
        }
    }

    /**
     * @param {Wallet} wallet 
     */
    setConnectedWallet(wallet) {
        this.connectedWallet = wallet;
    }

    /**
     * @param {Object} data 
     * @returns {String}
     */
    getEstimateGas(data) {
        return new Promise((resolve, reject) => {
            this.web3.eth.estimateGas(data, function(err, gas) {
                if (!err) {
                    resolve(utils.hex(gas));
                } else {
                    utils.rejectMessage(err, reject);
                }
            });
        });
    }

    getGasPrice() {
        return new Promise((resolve, reject) => {
            this.web3.eth.getGasPrice(function(err, gasPrice) {
                if (!err) {
                    resolve(utils.hex(gasPrice.toString()));
                } else {
                    utils.rejectMessage(err, reject);
                }
            });
        });
    }

    connectWallet(adapter) {
        return new Promise(async (resolve, reject) => {
            if (this.detectedWallets[adapter]) {
                let wallet = this.detectedWallets[adapter];
                wallet.connect()
                .then(() => {
                    resolve(wallet);
                })
                .catch(error => {
                    reject(error);
                });
            } else {
                reject('wallet-not-found');
            }
        });
    }

    getDetectedWallets(filter) {
        return Object.fromEntries(Object.entries(this.detectedWallets).filter(([key]) => {
            return filter.includes(key);
        }));
    }

    detectWallets() {
        if (typeof window != 'undefined') {
            const Wallet = require('./wallet');

            if (window.ethereum) {
                if (window.ethereum.isMetaMask) {
                    this.detectedWallets['metamask'] = new Wallet('metamask', this);
                }

                if (window.ethereum.isTrust) {
                    this.detectedWallets['trustwallet'] = new Wallet('trustwallet', this);
                }
            }
            
            if (window.BinanceChain) {
                this.detectedWallets['binancewallet'] = new Wallet('binancewallet', this);
            }

            if (this.infuraId) {
                this.detectedWallets['walletconnect'] = new Wallet('walletconnect', this);
            }
        }
    }

    Coin() {
        return new Coin(this);
    }

    Token(address, abi = null) {
        return new Token(address, abi, this);
    }
    
    Contract(address, abi) {
        return new Contract(address, abi, this);
    }

    Transaction(hash) {
        return new Transaction(hash, this);
    }
}

module.exports = Provider;