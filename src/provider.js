const Web3 = require('web3');
const utils = require('./utils');
const Methods = require('./methods');
const Coin = require('./entity/coin');
const Token = require('./entity/token');
const Contract = require('./entity/contract');
const Transaction = require('./entity/transaction');
const wagmiChains = require('@wagmi/chains');
const Web3Modal = require('@multiplechain/web3modal');

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
     * @var {Object}
     */
    connectedWallet = {};

    /**
     * @var {Object}
     */
    supportedWallets = {};

    /**
     * @param {Object} options
     */
    constructor(options) {

        this.network = options.network;
        this.testnet = options.testnet;
        this.wcProjectId = options.wcProjectId;
        this.wcThemeMode = options.wcThemeMode || 'light';

        let mainnets = {};
        let testnets = {};
        Object.keys(wagmiChains).forEach(function(key) {
            let chain = wagmiChains[key];
            let explorerUrl = chain.blockExplorers ? chain.blockExplorers.default.url : null;
            chain = Object.assign(chain, {
                explorerUrl,
                hexId: "0x" + chain.id.toString(16),
                rpcUrl: chain.rpcUrls.default.http[0],
            });

            
            if (key.includes('Testnet')) { 
                testnets[key.replace('Testnet', '')] = chain;
            } else {
                mainnets[key] = chain;
            }
        });

        let networks = this.testnet ? testnets : mainnets;

        if (typeof this.network == 'object') {
            this.network = this.network;
        } else if (networks[this.network]) {
            this.network = networks[this.network];
        } else {
            throw new Error('Network not found!');
        }

        this.setWeb3Provider(new Web3(new Web3.providers.HttpProvider(this.network.rpcUrl)));

        if (this.network.wsUrl) {
            this.qrPayments = true;
            this.web3ws = new Web3(new Web3.providers.WebsocketProvider(this.network.wsUrl));
        }

        this.initSupportedWallets();
    }

    /**
     * @param {Object} options
     * @param {Function} callback
     * @returns {Object}
     */
    async listenTransactions(options, callback) {
        let receiver = options.receiver;
        let tokenAddress = options.tokenAddress;
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
        if (this.web3Modal) return web3Modal;

        this.web3Modal = new Web3Modal({
            network: this.network,
            projectId: this.wcProjectId,
            themeMode: this.wcThemeMode,
        });

        this.web3Modal.getName = () => {
            return 'Web3 Wallets';
        }

        return this.web3Modal;
    }

    /**
     * @returns {void}
     */
    initSupportedWallets() {
        const Wallet = require('./wallet');
        
        this.supportedWallets  = {
            metamask: new Wallet('metamask', this),
            trustwallet: new Wallet('trustwallet', this),
            binancewallet: new Wallet('binancewallet', this),
            phantom: new Wallet('phantom', this),
        };

        if (this.wcProjectId) {
            this.supportedWallets['web3modal'] = this.createWeb3Modal();
            this.supportedWallets['walletconnect'] = new Wallet('walletconnect', this);
        }
    }

    /**
     * @param {Array|null} filter 
     * @returns {Array}
     */
    getSupportedWallets(filter) {
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
     * @param {String} ensDomain
     * @returns 
     */
    getAddressFromEns(ensDomain) {
        return this.methods.getAddressFromEns(ensDomain);
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
     * @param {Array} abi 
     * @returns {Contract}
     */
    newContract(abi) {
        return this.methods.newContract(abi);
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