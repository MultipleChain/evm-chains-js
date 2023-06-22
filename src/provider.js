const Web3 = require('web3');
const utils = require('./utils');
const Coin = require('./entity/coin');
const Token = require('./entity/token');
const Contract = require('./entity/contract');
const Transaction = require('./entity/transaction');

class Provider {

    /**
     * @var {Object}
     */
    web3ws = null;

    /**
     * @var {Boolean}
     */
    qrPayments = false;

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

        this.setWeb3Provider(new Web3(new Web3.providers.HttpProvider(this.network.rpcUrl)));

        if (this.network.wsUrl) {
            this.qrPayments = true;
            this.web3ws = new Web3(new Web3.providers.WebsocketProvider(this.network.wsUrl));
        }


        this.detectWallets();
    }

    /**
     * @param {String} receiver 
     * @param {Number} amount
     * @param {Function} callback
     * @returns {Object}
     */
    async listenTransactions(receiver, tokenAddress, callback) {
        if (this.web3ws) {
            if (tokenAddress) {
                receiver = receiver.replace('0x', '');
                receiver = receiver.toLowerCase();
                receiver = "0x000000000000000000000000" + receiver;
                let subscription = this.web3ws.eth.subscribe('logs', {
                    address: tokenAddress,
                    topics: [null, null, receiver]
                });
            
                subscription.on("data", (data) =>  {
                    callback(subscription, this.Transaction(data.transactionHash));
                });
            } else {
                let balance = await this.methods.getBalance(receiver);
                let subscription = this.web3ws.eth.subscribe('newBlockHeaders');

                subscription.on("data", async (blockHeader) => {
                    let newbalance = await this.methods.getBalance(receiver);
                    if (balance < newbalance) {
                        balance = await this.methods.getBalance(receiver);
                        let currentBlock = await this.methods.getBlock(blockHeader.hash, true);
                        currentBlock.transactions.forEach(transaction => {
                            if (transaction.to && transaction.to.toLowerCase() == receiver.toLowerCase()) {
                                callback(subscription, this.Transaction(transaction.hash));
                            }
                        });
                    }
                });
            }
        } else {
            throw new Error('Websocket provider not found!');
        }
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