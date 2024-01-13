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
        abi = abi || ABI;
        this.address = address;
        this.provider = provider;
        this.contract = this.provider.methods.contract(this.address, abi, this.provider.web3);
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
        return this.contract.name();
    }

    /**
     * @returns {String|Object}
     */
    getSymbol() {
        return this.contract.symbol();
    }

    /**
     * @returns {String|Object}
     */
    async getDecimals() {
        return parseInt((await this.contract.decimals()));
    }

    /**
     * @returns {Float|Object}
     */
    async getTotalSupply() {
        let decimals = await this.getDecimals();
        let totalSupply = await this.contract.totalSupply();
        return utils.toDec(totalSupply, decimals);
    }

    /**
     * @param {String} address
     * @returns {Float|Object}
     */
    async getBalance(address) {
        let decimals = await this.getDecimals();
        let balance = await this.contract.balanceOf(address);
        return utils.toDec(balance, decimals);
    }

    /**
     * @param {String} from
     * @param {String} to
     * @param {Integer} amount
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
    
                amount = utils.toHex(amount, (await this.getDecimals()));
    
                const data = await this.contract.interface.encodeFunctionData('transfer', [to, amount]);
                const gas = utils.hex(await this.contract.transfer.estimateGas(to, amount, {from}));
    
                return resolve([{
                    to: this.address,
                    value: '0x0',
                    from,
                    gas,
                    data
                }]);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * @param {String} spender
     * @param {Number} amount
     * @returns {Boolean}
     */
    approve(from, spender, amount) {
        return new Promise(async (resolve, reject) => {
            try {
                amount = utils.toHex(amount, (await this.getDecimals()));
                
                const data = await this.contract.interface.encodeFunctionData('approve', [spender, amount]);
                const gas = utils.hex(await this.contract.approve.estimateGas(spender, amount, {from}));
                
                return resolve([{
                    to: this.address,
                    value: '0x0',
                    from,
                    gas,
                    data
                }]);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * @param {String} owner
     * @param {String} spender
     * @returns {Boolean}
     */
    async allowance(owner, spender) {
        return parseFloat(utils.toDec(
            await this.contract.allowance(owner, spender), 
            await this.getDecimals()
        ));
    }
}

module.exports = Token;