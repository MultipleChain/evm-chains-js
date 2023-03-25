const utils = require('../utils');
const ABI = require('../../resources/erc20.json');

class Token {
    
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
    provider;

    /**
     * @param {String} address 
     * @param {Array|null} abi
     * @param {Provider} provider
     */
    constructor(address, abi = null, provider) {
        this.address = address;
        this.provider = provider;
        this.contract = provider.Contract(address, abi || ABI);
    }

    /**
     * @returns {String}
     */
    getAddress() {
        return this.address;
    }
    
    /**
     * @returns {String|Object}
     */
    getName() {
        return this.contract.call('name');
    }

    /**
     * @returns {String|Object}
     */
    getSymbol() {
        return this.contract.call('symbol');
    }

    /**
     * @returns {String|Object}
     */
    getDecimals() {
        return this.contract.call('decimals');
    }

    /**
     * @returns {Float|Object}
     */
    async getTotalSupply() {
        let decimals = await this.getDecimals();
        let totalSupply = await this.contract.call('totalSupply');
        return utils.toDec(totalSupply, decimals);
    }

    /**
     * @param {String} address
     * @returns {Float|Object}
     */
    async getBalance(address) {
        let decimals = await this.getDecimals();
        let balance = await this.contract.call('balanceOf', address);
        return utils.toDec(balance, decimals);
    }

    /**
     * @param {String} to
     * @param {Integer} amount
     * @returns {String|Object}
     */
    transfer(from, to, amount) {
        return new Promise(async (resolve, reject) => {
    
            if (parseFloat(amount) > await this.getBalance(from)) {
                return reject('insufficient-balance');
            }

            if (parseFloat(amount) < 0) {
                return reject('transfer-amount-error');
            }

            amount = utils.toHex(amount, (await this.getDecimals()));

            let data = this.contract.getData('transfer', to, amount, {from});
            
            let gasPrice = await this.provider.methods.getGasPrice();

            let gas = await this.provider.methods.getEstimateGas({
                to: this.address,
                value: '0x0',
                from,
                data
            });

            return resolve([{
                to: this.address,
                value: '0x0',
                gasPrice,
                from,
                gas,
                data
            }]);
        });
    }

    /**
     * @param {String} spender
     * @param {Number} amount
     * @returns {Boolean}
     */
    approve(from, spender, amount) {
        return new Promise(async (resolve, reject) => {
            amount = utils.toHex(amount, (await this.getDecimals()));
            
            let data = this.contract.getData('approve', spender, amount, {from});
            
            let gas = await this.provider.methods.getEstimateGas({
                to: this.address,
                value: '0x0',
                from,
                data
            });

            return resolve([{
                to: this.address,
                value: '0x0',
                from,
                gas,
                data
            }]);
        });
    }

    /**
     * @param {String} owner
     * @param {String} spender
     * @returns {Boolean}
     */
    async allowance(owner, spender) {
        return parseFloat(utils.toDec(
            await this.contract.call('allowance', owner, spender), 
            await this.getDecimals()
        ));
    }
}

module.exports = Token;