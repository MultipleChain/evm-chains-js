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
    async getEstimateGas(method, ...args) {
        let ops = {};
        if (args.length > 0) {
            ops = args[args.length - 1];
            args.splice(args.length - 1, 1)
        }
        return utils.hex((await this.methods[method](...args).estimateGas(ops)));
    }

    /**
     * 
     * @param {String} method 
     * @param  {Array} args 
     * @param {Object} options
     * @returns {any}
     */
    call(method, args = [], options = {}) {
        return this.methods[method](...args).call(options);
    }

    /**
     * 
     * @param {String} method 
     * @param  {Array} args 
     * @param {Object} options
     * @returns {any}
     */
    send(method, args = [], options = {}) {
        return this.methods[method](...args).send(options);
    }
}

module.exports = Contract;