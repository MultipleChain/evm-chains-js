const adapters = {
    metamask: require('./adapters/metamask'),
    binancewallet: require('./adapters/binancewallet'),
    trustwallet: require('./adapters/trustwallet'),
    walletconnect: require('./adapters/walletconnect'),
    phantom: require('./adapters/phantom'),
    bitget: require('./adapters/bitget'),
    okx: require('./adapters/okx'),
}

/**
 * @param {String} adapter
 * @param {Object} provider
 */
module.exports = getAdapter = (adapter, provider) => {
    return adapters[adapter](provider);
}