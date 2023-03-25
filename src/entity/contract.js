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
     * @var {Object}
     */
    methods;

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
        this.methods = this.contract.methods;
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
        return this.methods[method](...data).encodeABI();
    }

    /**
     * @param {String} method
     * @param  {...any} data 
     * @returns {String}
     */
    async getEstimateGas(method, ...data) {
        let ops = {};
        if (data.length > 0) {
            ops = data[data.length - 1];
            data.splice(data.length - 1, 1)
        }
        return utils.hex((await this.methods[method](...data).estimateGas(ops)));
    }
}

module.exports = Contract;