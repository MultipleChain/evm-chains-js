const utils = require('../utils');

class Coin {

    /**
     * @var {String} 
     */
    symbol;

    /**
     * @var {String} 
     */
    decimals;

    /**
     * @var {Provider} 
     */
    provider;

    /**
     * @param {Provider} provider 
     */
    constructor(provider) {
        this.provider = provider;
        this.decimals = provider.network.nativeCurrency.decimals;
        this.symbol = provider.network.nativeCurrency.symbol;
    }

    /**
     * @returns {String}
     */
    getSymbol() {
        return this.symbol;
    }

    /**
     * @returns {Integer}
     */
    getDecimals() {
        return this.decimals;
    }

    /**
     * @param {String} address
     * @returns {Float}
     */
    async getBalance(address) {
        try {
            let balance = await this.provider.methods.getBalance(address);
            return parseFloat((parseInt(balance) / 10**this.decimals).toFixed(6));
        } catch (error) {
            throw error;
        }
    }

    /**
     * @param {String} from
     * @param {String} to 
     * @param {Float|Integer} amount 
     * @returns {String|Object}
     */
    transfer(from, to, amount) {
        return new Promise(async (resolve, reject) => {
            try {
                if (parseFloat(amount) > await this.getBalance(from)) {
                    return reject('insufficient-balance');
                }

                if (parseFloat(amount) < 0) {
                    return reject('transfer-amount-error');
                }

                amount = utils.toHex(amount, this.decimals);
                
                let gas = await this.provider.methods.getEstimateGas({
                    to,
                    from,
                    value: amount,
                    data: "0x",
                });

                return resolve([{
                    to,
                    from,
                    value: amount,
                    gas,
                    data: "0x",
                }]);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = Coin;