const {ethers} = require('ethers');
const Coin = require('./entity/coin');
const Token = require('./entity/token');
const Contract = require('./entity/contract');
const Transaction = require('./entity/transaction');

class Provider {

    /**
     * @var {Object}
     */
    methods;

    /**
     * @var {Boolean}
     */
    testnet = false;

    /**
     * @var {String}
     */
    infuraId = null;

    /**
     * @var {Object}
     */
    network = {};

    /**
     * @var {Object}
     */
    detectedWallets = {};

    /**
     * @var {Object}
     */
    connectedWallet = {};

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
            this.setWeb3Provider(new ethers.providers.JsonRpcProvider(this.network.rpcUrl));
        }

        this.detectWallets();
    }

    /**
     * @param {Object} web3Provider 
     */
    setWeb3Provider(web3Provider) {
        let Methods = require('./methods');
        this.methods = new Methods(this, web3Provider);
    }

    /**
     * @param {Wallet} wallet 
     */
    setConnectedWallet(wallet) {
        this.connectedWallet = wallet;
    }

    /**
     * @param {String} adapter 
     * @returns {Promise}
     */
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

    /**
     * @param {Array} filter 
     * @returns {Array}
     */
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

    /**
     * @returns {Coin}
     */
    Coin() {
        return new Coin(this);
    }

    /**
     * @param {String} address 
     * @param {Array} abi 
     * @returns {Token}
     */
    Token(address, abi = null) {
        return new Token(address, abi, this);
    }
    
    /**
     * @param {String} address 
     * @param {Array} abi 
     * @returns {Contract}
     */
    Contract(address, abi) {
        return new Contract(address, abi, this);
    }

    /**
     * @param {String} hash 
     * @returns {Transaction}
     */
    Transaction(hash) {
        return new Transaction(hash, this);
    }
}

module.exports = Provider;