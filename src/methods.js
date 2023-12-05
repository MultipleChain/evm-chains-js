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

    checkResult(result) {
        if (result.error) {
            if (result.error.code == -32000) {
                throw new Error('rpc-timeout');
            }
            throw new Error(result.error.message);
        }
        return result;
    }

    /**
     * @param {Object} data 
     * @returns {String}
     */
    async getEstimateGas(data) {
        return utils.hex((this.checkResult(await this.web3Provider.eth.estimateGas(data))).toString());
    }

    /**
     * @returns {String}
     */
    async getGasPrice() {
        return utils.hex((this.checkResult(await this.web3Provider.eth.getGasPrice())).toString());
    }
    
    /**
     * @param ...args
     * @returns {Object}
     */
    async getBlock(...args) {
        return this.checkResult(await this.web3Provider.eth.getBlock(...args));
    }
    
    /**
     * @returns {Number}
     */
    async getBlockNumber() {
        return this.checkResult(await this.web3Provider.eth.getBlockNumber());
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    async getTransaction(hash) {
        return this.checkResult(await this.web3Provider.eth.getTransaction(hash));
    }

    /**
     * @param {String} hash 
     * @returns {Object}
     */
    async getTransactionReceipt(hash) {
        return this.checkResult(await this.web3Provider.eth.getTransactionReceipt(hash));
    }

    /**
     * @param {String} hash 
     * @returns {Number}
     */
    async getBalance(address) {
        return this.checkResult(await this.web3Provider.eth.getBalance(address));
    }
    
}

module.exports = Methods;