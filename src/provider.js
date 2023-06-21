const Web3 = require('web3');
const utils = require('./utils');
const Coin = require('./entity/coin');
const Token = require('./entity/token');
const Moralis = require("moralis").default;
const Contract = require('./entity/contract');
const Transaction = require('./entity/transaction');
const { EvmChain } = require("@moralisweb3/common-evm-utils");

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
     * @var {String}
     */
    moralisApiKey = null;

    /**
     * @var {Boolean}
     */
    moralisStarted = false;

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
     * @param {String} moralisApiKey
     */
    constructor(network, testnet = false, infuraId = null, moralisApiKey = null) {

        this.testnet = testnet;
        this.infuraId = infuraId;
        this.moralisApiKey = moralisApiKey;

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

        this.detectWallets();
    }

    /**
     * @returns {Promise<void>}
     */
    async startMoralis() {
        if (this.moralisStarted) {
            return this.moralisStarted;
        }

        await Moralis.start({
            apiKey: this.moralisApiKey,
        });

        return this.moralisStarted = true;
    }

    /**
     * @param {String} receiver 
     * @param {Number} amount
     * @returns {Object}
     */
    async getLastTransactionByReceiver(receiver, tokenAddress) {
        await this.startMoralis();
        let amount, hash;
        if (tokenAddress) {
            let response = await Moralis.EvmApi.transaction.getWalletTransactions({
                limit: 1,
                address: tokenAddress,
                chain: EvmChain.create(this.network.id)
            });
            
            let tx = response.toJSON().result[0];
            hash = tx.hash;
            let data = utils.abiDecoder(tx.input);
            if (data.name == 'transfer') {
                amount = data.params[1].value;
                let token = this.Token(tokenAddress);
                amount = utils.toDec(amount, (await token.getDecimals()));
            } else {
                return {
                    hash: tx.hash,
                    amount: 0
                }
            }
        } else {
            let response = await Moralis.EvmApi.transaction.getWalletTransactions({
                limit: 1,
                address: receiver,
                chain: EvmChain.create(this.network.id)
            });
            
            let tx = response.toJSON().result[0];
            hash = tx.hash;
            amount = utils.toDec(tx.value, (await this.Coin().getDecimals()));
        }

        return {
            hash,
            amount
        };
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