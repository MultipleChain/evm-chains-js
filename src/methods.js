const utils = require('./utils');
const {ethers} = require('ethers');

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
        return new ethers.Contract(address, abi, this.web3Provider);
    }

    /**
     * @param {Object} data 
     * @returns {String}
     */
    async getEstimateGas(data) {
        return utils.hex((await this.web3Provider.estimateGas(data)).toString());
    }

    /**
     * @returns {String}
     */
    async getGasPrice() {
        return utils.hex((await this.web3Provider.getGasPrice()).toString());
    }
    
    /**
     * @returns {Number}
     */
    getBlockNumber() {
        return this.web3Provider.getBlockNumber();
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    getTransaction(hash) {
        return this.web3Provider.getTransaction(hash);
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    getTransactionReceipt(hash) {
        return this.web3Provider.getTransactionReceipt(hash);
    }

    /**
     * @param {String} hash 
     * @returns {Number}
     */
    async getBalance(address) {
        return (await this.web3Provider.getBalance(address));
    }
    
}

module.exports = Methods;