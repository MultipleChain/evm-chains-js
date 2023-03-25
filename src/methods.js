class Methods {

    web3;

    wallet;

    methods;

    constructor(web3) {
        this.web3 = web3;
        this.methods = web3.eth;
        this.wallet = web3.currentProvider;
    }

    contract(abi) {
        return this.methods.contract(abi);
    }
    
    getBlockNumber() {
        return new Promise((resolve) => {
            this.methods.getBlockNumber(function(err, blockNumber) {
                resolve(blockNumber);
            })
        });
    }

    getTransaction(hash) {
        return this.wallet.request({
            method: 'eth_getTransactionByHash',
            params: [hash]
        });
    }

    getTransactionReceipt(hash) {
        return this.wallet.request({
            method: 'eth_getTransactionReceipt',
            params: [hash]
        });
    }

    getBalance(address) {
        return this.wallet.request({
            method: 'eth_getBalance', 
            params: [address, 'latest']
        });
    }
    
}

module.exports = Methods;