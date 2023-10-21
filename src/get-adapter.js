const adapters = {
    metamask: require('./adapters/metamask'),
    binancewallet: require('./adapters/binancewallet'),
    trustwallet: require('./adapters/trustwallet'),
    walletconnect: require('./adapters/walletconnect'),
    phantom: require('./adapters/phantom'),
    web3modal: require('./adapters/web3modal'),
}

/**
 * @param {String} adapter
 * @param {Object} provider
 */
module.exports = getAdapter = (adapter, provider) => {
    return adapters[adapter](provider);
}