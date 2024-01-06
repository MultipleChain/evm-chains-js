const utils = require('./utils');
const ethers = require('ethers');

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
        this.web3Provider = web3Provider;
    }

    /**
     * @param {String} address 
     * @param {Array} abi 
     * @param {Object} provider
     * @returns {Object}
     */
    contract(address, abi, provider = null) {
        return new ethers.Contract(address, abi, provider);
    }

    /**
     * @param {Array} abi
     * @param {String} bytecode
     * @param {Object} signer
     * @returns {Object}
     */
    contractFactory(abi, bytecode, signer = null) {
        return new ethers.ContractFactory(abi, bytecode, signer);
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
     * @param ...args
     * @returns {Object}
     */
    getBlock(...args) {
        return this.web3Provider.getBlock(...args);
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
     * @param {String} address
     * @returns {Number}
     */
    getBalance(address) {
        return this.web3Provider.getBalance(address);
    }
    
}

module.exports = Methods;