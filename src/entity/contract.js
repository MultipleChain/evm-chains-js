const utils = require('../utils');

class Contract {

    /**
     * @var {Object}
     */
    provider;

    /**
     * @var {String}
     */
    address;

    /**
     * @var {Object}
     */
    contract;

    /**
     * @var {Number}
     */
    defaultGas = 50000;

    /**
     * 
     * @param {String} address 
     * @param {Provider} provider 
     */
    constructor(address, abi, provider) {
        this.address = address;
        this.provider = provider;
        this.contract = provider.methods.contract(address, abi, provider.web3);
    }

    /**
     * @returns {String}
     */
    getAddress() {
        return this.address;
    }

    /**
     * @param {String} method
     * @param  {Array} args
     * @returns {String}
     */
    getData(method, args = []) {
        return this.contract.interface.encodeFunctionData(method, args);
    }

    /**
     * @param {String} method
     * @param  {Array} args 
     * @param {Object} ops
     * @returns {String}
     */
    async getEstimateGas(method, args = [], ops = {}) {
        return utils.hex(await this.contract[method].estimateGas(...args, ops));
    }

    /**
     * 
     * @param {String} method 
     * @param  {Array} args 
     * @param {Object} options
     * @returns {any}
     */
    call(method, args = []) {
        return this.contract[method](...args);
    }
}

module.exports = Contract;
