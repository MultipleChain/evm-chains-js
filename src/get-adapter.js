const adapters = {
    metamask: require('./adapters/metamask'),
    binancewallet: require('./adapters/binancewallet'),
    trustwallet: require('./adapters/trustwallet'),
    walletconnect: require('./adapters/walletconnect'),
    phantom: require('./adapters/phantom')
}

/**
 * @param {String} adapter
 * @param {Object} provider
 */
module.exports = getAdapter = (adapter, provider) => {
    return adapters[adapter](provider);
}