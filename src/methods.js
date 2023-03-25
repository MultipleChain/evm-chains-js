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
     * @param {Object} data 
     * @returns {String}
     */
    async getEstimateGas(data) {
        return utils.hex((await this.web3Provider.eth.estimateGas(data)).toString());
    }

    /**
     * @returns {String}
     */
    async getGasPrice() {
        return utils.hex((await this.web3Provider.eth.getGasPrice()).toString());
    }
    
    /**
     * @returns {Number}
     */
    getBlockNumber() {
        return this.web3Provider.eth.getBlockNumber();
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    getTransaction(hash) {
        return this.web3Provider.eth.getTransaction(hash);
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    getTransactionReceipt(hash) {
        return this.web3Provider.eth.getTransactionReceipt(hash);
    }

    /**
     * @param {String} hash 
     * @returns {Number}
     */
    async getBalance(address) {
        return (await this.web3Provider.eth.getBalance(address));
    }
    
}

module.exports = Methods;