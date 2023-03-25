const Web3Utils = require('web3-utils');
const utils = require('@multiplechain/utils');

module.exports = Object.assign(utils, {
    isAddress(address) {
        return Web3Utils.isAddress(address);
    },
    rejectMessage(error, reject) {
        if (error.message == 'Not supported chainId') {
            return reject('not-accepted-chain')
        } else if (String(error.message).indexOf('chain ID') > -1) {
            return reject("not-accepted-chain");
        } else if (String(error.message).indexOf('Invalid RPC URL') > -1) {
            return reject("invalid-rpc-error");
        } else if (error.code == -32603) {
            return reject('transaction-create-fail');
        } else if (error.code == -32601) {
            return reject('non-supported-method');
        } else if (
            error.message == 'Already processing eth_requestAccounts. Please wait.' || 
            error.code == -32002    
        ) {
            return reject('already-processing');
        } else if (
            error.code == 4001 || 
            error.error == 'Rejected by user' || 
            error.message == 'cancelled' || 
            error.message == 'User canceled' || 
            error.message == 'User rejected the transaction' || 
            error.message == 'An unexpected error occurred'
        ) {
            return reject('request-rejected');
        } else if (error.message == 'User closed modal') {
            return reject("closed-walletconnect-modal");
        }  else if (
            String(error.message).indexOf('User') > -1 || 
            String(error.message).indexOf('Rejected') > -1 || 
            String(error.message).indexOf('cancelled') > -1 || 
            String(error.message).indexOf('canceled') > -1 || 
            String(error.message).indexOf('rejected') > -1 
        ) {
            return reject('request-rejected');
        } else if (error.message == 'transaction underpriced') { 
            return reject('transaction-underpriced');
        }
    
        return reject(error);
    }
})