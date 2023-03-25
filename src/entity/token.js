const utils = require('../utils');
const Contract = require('./contract');
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
        this.contract = new Contract(address, abi || ABI, provider);
    }

    /**
     * @param {String} address
     * @returns {Float|Object}
     */
    getBalance(address) {
        return new Promise((resolve, reject) => {
            this.contract.call('balanceOf', address, (error, balance) => {
                if (error) {
                    reject(error);
                } else {
                    this.contract.call('decimals', (error, decimals) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(parseFloat(balance.div(10**decimals).toString()));
                        }
                    });
                }
            });
        });
    }

    /**
     * @returns {String|Object}
     */
    getName() {
        return new Promise((resolve, reject) => {
            this.contract.call('name', (error, name) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(name);
                }
            });
        });
    }

    /**
     * @returns {Float|Object}
     */
    getTotalSupply() {
        return new Promise((resolve, reject) => {
            this.contract.call('totalSupply', (error, totalSupply) => {
                if (error) {
                    reject(error);
                } else {
                    this.contract.call('decimals', (error, decimals) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(parseFloat(totalSupply.div(10**decimals).toString()));
                        }
                    });
                }
            });
        });
    }

    /**
     * @returns {String|Object}
     */
    getSymbol() {
        return new Promise((resolve, reject) => {
            this.contract.call('symbol', (error, symbol) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(symbol);
                }
            });
        });
    }

    /**
     * @returns {String|Object}
     */
    getDecimals() {
        return new Promise((resolve, reject) => {
            this.contract.call('decimals', (error, decimals) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(parseInt(decimals.toNumber()));
                }
            });
        });
    }

    /**
     * @returns {String}
     */
    getAddress() {
        return this.address;
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
            
            let gasPrice = await this.provider.getGasPrice();

            let gas = await this.provider.getEstimateGas({
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
            
            let gas = await this.provider.getEstimateGas({
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
    allowance(owner, spender) {
        return new Promise((resolve, reject) => {
            this.contract.call('allowance', owner, spender, async (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(parseFloat(utils.toDec(result, await this.getDecimals())));
                }
            });
        });
    }
}

module.exports = Token;