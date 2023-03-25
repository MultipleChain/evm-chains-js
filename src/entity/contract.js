const utils = require('../utils');

class Contract {

    provider;

    address;
    
    contract;

    defaultGas = 50000;

    /**
     * 
     * @param {String} address 
     * @param {Provider} provider 
     */
    constructor(address, abi, provider) {
        this.address = address;
        this.provider = provider;
        this.contract = provider.methods.contract(abi).at(address);
    }

    /**
     * @param {String} method
     * @param  {...any} data 
     * @returns {String}
     */
    getData(method, ...data) {
        return this.contract[method].getData(...data);
    }

    /**
     * @returns {String}
     */
    getAddress() {
        return this.address;
    }

    /**
     * @param {String} method 
     * @param  {...any} params 
     * @returns {Promise}
     */
    call(method, ...params) {
        this.contract[method](...params);
    }
}

module.exports = Contract;