const ethers = require('ethers');
const utils = require('./utils');
const Methods = require('./methods');
const Coin = require('./entity/coin');
const Token = require('./entity/token');
const Contract = require('./entity/contract');
const wagmiChains = require('@wagmi/chains');
const Transaction = require('./entity/transaction');

class Provider {

    /**
     * @var {Object}
     */
    web3 = null;

    /**
     * @var {Object}
     */
    web3ws = null;

    /**
     * @var {Boolean}
     */
    qrPayments = false;

    /**
     * @var {Methods}
     */
    methods;

    /**
     * @var {Boolean}
     */
    testnet = false;

    /**
     * @var {String}
     */
    wcProjectId = null;

    /**
     * @var {String}
     */
    wcThemeMode = 'light';

    /**
     * @var {Web3Modal}
     */
    web3Modal;

    /**
     * @var {Object}
     */
    network = {};

    /**
     * @var {Array}
     */
    networks = [];

    /**
     * @var {Object}
     */
    supportedWallets;

    /**
     * @var {Object}
     */
    connectedWallet = {};

    /**
     * @var {Array}
     */
    wcCustomWallets = [];

    /**
     * @param {Object} options
     */
    constructor(options) {

        this.testnet = options.testnet;
        this.wcProjectId = options.wcProjectId;
        this.wcThemeMode = options.wcThemeMode || 'light';
        this.wcCustomWallets = options.wcCustomWallets || [];

        Object.keys(wagmiChains).forEach((key) => {
            let chain = wagmiChains[key];
            let explorerUrl = chain.blockExplorers ? chain.blockExplorers.default.url : null;

            let rpcUrl = chain.rpcUrls.default.http[0];
            if (chain.rpcUrls.infura) {
                rpcUrl = chain.rpcUrls.infura.http[0];
            } else if (chain.rpcUrls.alchemy) {
                rpcUrl = chain.rpcUrls.alchemy.http[0];
            }

            chain = Object.assign(chain, {
                explorerUrl,
                hexId: "0x" + chain.id.toString(16),
                rpcUrl,
            });

            if (chain.rpcUrls.default.webSocket && chain.rpcUrls.default.webSocket[0]) {
                chain.wsUrl = chain.rpcUrls.default.webSocket[0];
            } else if (chain.rpcUrls.infura && chain.rpcUrls.infura.webSocket && chain.rpcUrls.infura.webSocket[0]) {
                chain.wsUrl = chain.rpcUrls.infura.webSocket[0];
            } else if (chain.rpcUrls.alchemy && chain.rpcUrls.alchemy.webSocket && chain.rpcUrls.alchemy.webSocket[0]) {
                chain.wsUrl = chain.rpcUrls.alchemy.webSocket[0];
            }
            
            this.networks.push(chain)
        });

        this.setNetwork(options.network);
    }

    setNetwork(network) {
        if (typeof network == 'object') {
            this.network = network;
        } else if (utils.isNumeric(network)) {
            this.network = this.networks.find(n => n.id == parseInt(network));
        } else if (typeof network == 'string') {
            this.network = this.networks.find(n => n.network == network);
        } else {
            throw new Error('Invalid network!');
        }

        this.setWeb3Provider(new ethers.JsonRpcProvider(network.rpcUrl));

        if (network.wsUrl) {
            this.qrPayments = true;
            this.web3ws = new ethers.WebSocketProvider(network.wsUrl);
        }
    }

    getNetworks() {
        return this.networks;
    }

    /**
     * @param {Object} options
     * @param {Function} callback
     * @returns {Object}
     */
    async listenTransactions(options, callback) {
        const receiver = options.receiver;
        const tokenAddress = options.tokenAddress;
        const subscription = {
            unsubscribe: () => {} // will add later
        }
        if (this.web3ws) {
            if (tokenAddress) {
                const contract = this.methods.contract(tokenAddress, require('../resources/erc20.json'), this.web3ws);
            
                const eventHandler = (from, to, value, event) => {
                    if (to === receiver) {
                        callback(subscription, this.Transaction(event.log.transactionHash));
                    }
                };

                const listener = contract.on("Transfer", eventHandler);
                subscription.unsubscribe = () => {
                    listener.off("Transfer", eventHandler);
                }
            } else {
                let balance = await this.methods.getBalance(receiver);
                const eventHandler = async (blockNumber) => {
                    const newbalance = await this.methods.getBalance(receiver);
                    if (balance < newbalance) {
                        balance = await this.methods.getBalance(receiver);
                        let currentBlock = await this.methods.getBlock(blockNumber, true);
                        if (currentBlock.transactions) {
                            currentBlock.transactions.forEach(async transactionHash => {
                                const transaction = await this.methods.getTransaction(transactionHash);
                                if (transaction.to && transaction.to.toLowerCase() == receiver.toLowerCase()) {
                                    callback(subscription, this.Transaction(transaction.hash));
                                }
                            });
                        }
                    }
                };
                this.web3ws.on('block', eventHandler);
                subscription.unsubscribe = () => {
                    this.web3ws.off("block", eventHandler);
                }
            }
        } else {
            throw new Error('Websocket provider not found!');
        }
    }

    /**
     * @param {Object} web3Provider 
     */
    setWeb3Provider(web3Provider) {
        this.methods = new Methods(this, this.web3 = web3Provider);
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
            let detectedWallets = this.getDetectedWallets();
            if (detectedWallets[adapter]) {
                let wallet = detectedWallets[adapter];
                wallet.connect()
                .then(() => {
                    resolve(wallet);
                })
                .catch(error => {
                    utils.rejectMessage(error, reject);
                });
            } else {
                reject('wallet-not-found');
            }
        });
    }

    /**
     * @returns {Web3Modal}
     */
    createWeb3Modal() {
        const Web3Modal = require('@multiplechain/web3modal');
        
        if (this.web3Modal) return this.web3Modal;

        this.web3Modal = new Web3Modal({
            network: this.network,
            projectId: this.wcProjectId,
            themeMode: this.wcThemeMode,
            customWallets: this.wcCustomWallets
        });

        const originalCoinTransfer = this.web3Modal.coinTransfer.bind(this.web3Modal);
        const originalTokenTransfer = this.web3Modal.tokenTransfer.bind(this.web3Modal);

        this.web3Modal.coinTransfer = async (...args) => {
            return new Promise((resolve, reject) => {
                originalCoinTransfer(...args)
                .then(transactionId => {
                    resolve(this.Transaction(transactionId));
                })
                .catch(error => {
                    utils.rejectMessage(error, reject);
                });
            })
        };

        this.web3Modal.tokenTransfer = async (...args) => {
            return new Promise((resolve, reject) => {
                originalTokenTransfer(...args)
                .then(transactionId => {
                    resolve(this.Transaction(transactionId));
                })
                .catch(error => {
                    utils.rejectMessage(error, reject);
                });
            })
        };

        this.web3Modal.getName = () => {
            return 'Web3 Wallets';
        }

        return this.web3Modal;
    }

    /**
     * @param {Array|null} filter 
     * @returns {Array}
     */
    getSupportedWallets(filter) {

        if (!this.supportedWallets) {
            const Wallet = require('./wallet');
            
            this.supportedWallets  = {
                metamask: new Wallet('metamask', this),
                trustwallet: new Wallet('trustwallet', this),
                binancewallet: new Wallet('binancewallet', this),
                phantom: new Wallet('phantom', this),
                bitget: new Wallet('bitget', this),
                okx: new Wallet('okx', this),
                xdefi: new Wallet('xdefi', this),
            };

            if (this.wcProjectId) {
                this.supportedWallets['web3modal'] = this.createWeb3Modal();
                this.supportedWallets['walletconnect'] = new Wallet('walletconnect', this);
            }
        }

        return Object.fromEntries(Object.entries(this.supportedWallets).filter(([key]) => {
            return !filter ? true : filter.includes(key);
        }));
    }

    /**
     * @param {Array|null} filter 
     * @returns {Array}
     */
    getDetectedWallets(filter) {
        let detectedWallets = this.getSupportedWallets(filter);
        return Object.fromEntries(Object.entries(detectedWallets).filter(([key, value]) => {
            return value.isDetected() == undefined ? true : value.isDetected()
        }));
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

Provider.utils = utils;

Provider.BigNumber = require('bignumber.js');

module.exports = Provider;