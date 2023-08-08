const Web3 = require('web3');
const utils = require('./utils');
const getAdapter = require('./get-adapter');

class Wallet {

    /**
     * @var {Object}
     */
    adapter;

    /**
     * @var {Object}
     */
    wallet;
    
    /**
     * @var {Object}
     */
    provider;

    /**
     * @var {Object}
     */
    connectedNetwork;
    
    /**
     * @var {String}
     */
    connectedAccount;

    /**
     * @param {String} adapter 
     * @param {Object} provider 
     */
    constructor(adapter, provider) {
        this.provider = provider;
        this.setAdapter(adapter);
    }

    /**
     * @param {String} adapter 
     */
    setAdapter(adapter) {
        this.adapter = getAdapter(adapter, this.provider);
    }

    /**
     * @returns {String}
     */
    getKey() {
        return this.adapter.key;
    }

    /**
     * @returns {String}
     */
    getName() {
        return this.adapter.name;
    }

    /**
     * @returns {String}
     */
    getSupports() {
        return this.adapter.supports;
    }

    /**
     * @returns {String}
     */
    getDeepLink() {
        return this.adapter.deepLink;
    }

    /**
     * @returns {String}
     */
    getDownloadLink() {
        return this.adapter.download;
    }

    /**
     * @returns {Boolean}
     */
    isDetected() {
        return this.adapter.detected;
    }

    /**
     * @param {Object} params
     * @returns {Prmise}
     */
    request(params) {
        return this.wallet.request(params);
    }

    /**
     * @returns {Array}
     */
    getAccounts() {
        return this.request({ method: 'eth_accounts' });
    }

    /**
     * @returns {String}
     */
    async getChainHexId() {
        let id = await this.request({method: 'eth_chainId'});
        if (id == '0x01') return '0x1';
        if (utils.isNumeric(id)) return '0x' + id.toString(16);
        return id;
    };

    /**
     * @returns {Boolean}
     */
    async isConnected() {
        return (await this.getAccounts()).length !== 0;
    }

    /**
     * @returns {Promise}
     */
    connect() {
        return new Promise((resolve, reject) => {
            let timer;
            if (this.getKey() != 'walletconnect') {
                let time = 0;
                let timeout = 15;
                timer = setInterval(async () => {
                    time += 1;
                    if (time > timeout) {
                        clearInterval(timer);
                        reject('timeout');
                    }
                }, 1000);
            }

            this.connection().then((connectedAccount) => {
                resolve(connectedAccount);
            })
            .catch((error) => {
                utils.rejectMessage(error, reject);
            })
            .finally(() => {
                clearInterval(timer);
            });
        });
    }

    /**
     * @returns {Promise}
     */
    connection() {
        return new Promise((resolve, reject) => {
            this.adapter.connect()
            .then(async wallet => {
                this.wallet = wallet;
                let chainHexId = await this.getChainHexId();
                if (this.provider.network.hexId == chainHexId) {
                    this.provider.setConnectedWallet(this);
                    this.provider.setWeb3Provider(new Web3(this.wallet));

                    this.connectedAccount = (await this.getAccounts())[0];
                    this.connectedNetwork = this.provider.network;
                    resolve(this.connectedAccount);
                } else {
                    reject('not-accepted-chain');
                }
            })
            .catch(error => {
                utils.rejectMessage(error, reject);
            });
        })
    }

    /**
     * @param {Array} params 
     * @returns {Promise}
     */
    sendTransaction(params) {
        return new Promise(async (resolve, reject) => {
            this.request({
                method: 'eth_sendTransaction',
                params,
            })
            .then((transactionId) => {
                resolve(transactionId);
            })
            .catch((error) => {
                utils.rejectMessage(error, reject);
            });
        });
    }

    /**
     * @param {String} to
     * @param {Integer} amount
     * @param {String} tokenAddress
     * @return {Transaction|Object}
     * @throws {Error}
     */
    tokenTransfer(to, amount, tokenAddress) {
        return new Promise(async (resolve, reject) => {
            try {
                this.validate(to, amount, tokenAddress);
                let token = this.provider.Token(tokenAddress);
                let data = await token.transfer(this.connectedAccount, to, amount);

                this.sendTransaction(data)
                .then((transactionId) => {
                    resolve(this.provider.Transaction(transactionId));
                })
                .catch((error) => {
                    utils.rejectMessage(error, reject);
                });
            } catch (error) {
                utils.rejectMessage(error, reject);
            }
        });
    }

    /**
     * @param {String} to
     * @param {Integer} amount
     * @return {Transaction|Object}
     * @throws {Error}
     */
    coinTransfer(to, amount) {
        return new Promise(async (resolve, reject) => {
            try {
                this.validate(to, amount);
                let coin = this.provider.Coin();
                let data = await coin.transfer(this.connectedAccount, to, amount);
                
                this.sendTransaction(data)
                .then((transactionId) => {
                    resolve(this.provider.Transaction(transactionId));
                })
                .catch((error) => {
                    utils.rejectMessage(error, reject);
                });
            } catch (error) {
                utils.rejectMessage(error, reject);
            }
        });
    }

    /**
     * @param {String} to
     * @param {Integer} amount
     * @param {String|null} tokenAddress
     * @return {Transaction|Object}
     * @throws {Error}
     */
    transfer(to, amount, tokenAddress = null) {
        if (tokenAddress) {
            return this.tokenTransfer(to, amount, tokenAddress);
        } else {
            return this.coinTransfer(to, amount);
        }
    }

    /**
     * @param {String} to
     * @param {Integer} amount
     * @param {String|null} tokenAddress
     * @return {Boolean}
     * @throws {Error}
     */
    validate(to, amount, tokenAddress = null) {
        if (!this.connectedAccount) {
            throw new Error("no-linked-wallet");
        } 

        if (amount <= 0) {
            throw new Error("transfer-amount-error");
        } 

        if (utils.isAddress(to) === false) {
            throw new Error("invalid-receiver-address");
        }

        if (tokenAddress && utils.isAddress(tokenAddress) === false) {
            throw new Error("invalid-token-address");
        }

        return true;
    }

    // Events    
    chainChanged(callback) {
        this.wallet.on('chainChanged', (chainHexId) => {
            callback(chainHexId);
        });
    }

    accountsChanged(callback) {
        this.wallet.on('accountsChanged', (accounts) => {
            callback(accounts);
        });
    }

    networkChanged(callback) {
        this.wallet.on('networkChanged', (param) => {
            callback(param);
        });
    }
    
    disconnectEvent(callback) {
        this.wallet.on('disconnect', (code, reason) => {
            callback(code, reason);
        });
    }
    
} 

module.exports = Wallet;