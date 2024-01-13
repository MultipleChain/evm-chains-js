const ethers = require('ethers');
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
        return this.adapter.isDetected ? this.adapter.isDetected() : undefined;
    }

    /**
     * @param {Object} params
     * @returns {Prmise}
     */
    async request(params) {
        let res = await this.wallet.request(params);
        if (res && res.error) {
            if (res.error.code == -32000) {
                throw new Error('rpc-timeout');
            }
            throw new Error(res.error.message);
        }
        return res;
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
    async getChainId() {
        if (this.wallet?.chainId) {
            return this.wallet?.chainId;
        }
        return parseInt((await this.request({method: 'eth_chainId'})), 16);
    }

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
            this.adapter.connect()
            .then(async wallet => {
                this.wallet = wallet;
                let chainId = await this.getChainId();
                
                if (!this.provider.network) {
                    this.provider.setNetwork(chainId);
                } else if (this.provider.network.id != chainId) {
                    return reject('not-accepted-chain');
                } 

                this.provider.setConnectedWallet(this);
                this.provider.setWeb3Provider(new ethers.BrowserProvider(this.wallet));

                this.connectedAccount = (await this.getAccounts())[0];
                this.connectedNetwork = this.provider.network;
                resolve(this.connectedAccount);
            })
            .catch(error => {
                utils.rejectMessage(error, reject);
            });
        });
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
                token.transfer(this.connectedAccount, to, amount)
                .then((data) => {
                    this.sendTransaction(data)
                    .then((transactionId) => {
                        resolve(this.provider.Transaction(transactionId));
                    })
                    .catch((error) => {
                        utils.rejectMessage(error, reject);
                    });
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
                coin.transfer(this.connectedAccount, to, amount)
                .then((data) => {
                    this.sendTransaction(data)
                    .then((transactionId) => {
                        resolve(this.provider.Transaction(transactionId));
                    })
                    .catch((error) => {
                        utils.rejectMessage(error, reject);
                    });
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

    /**
     * @param {Array} abi 
     * @param {String} byteCode 
     * @param  {Array} args 
     * @param {Number} value
     * @returns {Prmise<Object>}
     */
    deployContract(abi, byteCode, args = [], value = null) {
        return new Promise(async (resolve, reject) => {
            try {
                let factory = this.provider.methods.contractFactory(
                    abi, byteCode, await this.provider.web3.getSigner()
                );
                
                if (value) {
                    args.push({value: ethers.utils.parseEther(value)});
                }

                const deployedContract = await factory.deploy(...args);

                await deployedContract.waitForDeployment();

                resolve(deployedContract.target);
            } catch (error) {
                utils.rejectMessage(error, reject);
            }
        });
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