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
        this.contract = provider.methods.contract(address, abi);
    }

    /**
     * @returns {String}
     */
    getAddress() {
        return this.address;
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
     * @param {String} method 
     * @param  {...any} params 
     * @returns {Promise}
     */
    call(method, ...params) {
        return this.contract[method](...params);
    }
}

module.exports = Contract;