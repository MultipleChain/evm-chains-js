const utils = require('./utils');

class Methods {

    /**
     * @var {Object}
     */
    provider;

    /**
     * @var {Object}
     */
    web3Provider;

    /**
     * @param {Object} provider 
     * @param {Object} web3Provider
     */
    constructor(provider, web3Provider) {
        this.provider = provider;
        this.web3Provider = web3Provider
    }

    /**
     * @param {String} address 
     * @param {Array} abi 
     * @returns {Object}
     */
    contract(address, abi) {
        return new this.web3Provider.eth.Contract(abi, address);
    }

    /**
     * @param {Array} abi 
     * @returns {Object}
     */
    newContract(abi) {
        return new this.web3Provider.eth.Contract(abi);
    }

    /**
     * @param {Object} data 
     * @returns {String}
     */
    getEstimateGas(data) {
        return new Promise((resolve, reject) => {
            this.web3Provider.eth.estimateGas(data, (error, gas) => {
                if (error) {
                    reject(error);
                }
                resolve(utils.hex(gas.toString()));
            });
        });
    }

    /**
     * @returns {String}
     */
    getGasPrice() {
        return new Promise((resolve, reject) => {
            this.web3Provider.eth.getGasPrice((error, gasPrice) => {
                if (error) {
                    reject(error);
                }
                resolve(utils.hex(gasPrice.toString()));
            });
        });
    }
    
    /**
     * @param ...args
     * @returns {Object}
     */
    getBlock(...args) {
        return new Promise((resolve, reject) => {
            this.web3Provider.eth.getBlock(...args, (error, block) => {
                if (error) {
                    reject(error);
                }
                resolve(block);
            });
        });
    }
    
    /**
     * @returns {Number}
     */
    getBlockNumber() {
        return new Promise((resolve, reject) => {
            this.web3Provider.eth.getBlockNumber((error, blockNumber) => {
                if (error) {
                    reject(error);
                }
                resolve(blockNumber);
            });
        });
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    getTransaction(hash) {
        return new Promise((resolve, reject) => {
            this.web3Provider.eth.getTransaction(hash, (error, transaction) => {
                if (error) {
                    reject(error);
                }
                resolve(transaction);
            });
        });
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    getTransactionReceipt(hash) {
        return new Promise((resolve, reject) => {
            this.web3Provider.eth.getTransactionReceipt(hash, (error, transaction) => {
                if (error) {
                    reject(error);
                }
                resolve(transaction);
            });
        });
    }

    /**
     * @param {String} hash 
     * @returns {Number}
     */
    async getBalance(address) {
        return new Promise((resolve, reject) => {
            this.web3Provider.eth.getBalance(address, (error, balance) => {
                if (error) {
                    reject(error);
                }
                resolve(balance);
            });
        })
    }
    
}

module.exports = Methods;