const utils = require('./utils');

class Methods {

    /**
     * @var {Object}
     */
    provider;

    /**
     * @var {Object}
     */
    ethersProvider;

    /**
     * @param {Object} provider 
     */
    constructor(provider) {
        this.provider = provider;
        this.ethersProvider = provider.ethers.currentProvider;
    }

    /**
     * @param {String} address 
     * @param {Array} abi 
     * @returns {Object}
     */
    contract(address, abi) {
        return new this.provider.ethers.Contract(address, abi, this.ethersProvider);
    }

    /**
     * @param {Object} data 
     * @returns {String}
     */
    async getEstimateGas(data) {
        return utils.hex((await this.ethersProvider.estimateGas(data)).toString());
    }

    /**
     * @returns {String}
     */
    async getGasPrice() {
        return utils.hex((await this.ethersProvider.getGasPrice()).toString());
    }
    
    /**
     * @returns {Number}
     */
    getBlockNumber() {
        return this.ethersProvider.getBlockNumber();
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    getTransaction(hash) {
        return this.ethersProvider.getTransaction(hash);
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    getTransactionReceipt(hash) {
        return this.ethersProvider.getTransactionReceipt(hash);
    }

    /**
     * @param {String} hash 
     * @returns {Number}
     */
    async getBalance(address) {
        return (await this.ethersProvider.getBalance(address));
    }
    
}

module.exports = Methods;