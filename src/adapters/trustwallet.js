module.exports = trustWallet = (provider) => {
    const wallet = window.ethereum;
    const testnet = provider.testnet
    const switcher = require('./switcher.js')(wallet, provider);

    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.request({ method: 'eth_requestAccounts' })
                .then(async () => {

                    if (testnet) {
                        return resolve(wallet);
                    }

                    switcher.maybeSwitch()
                    .then(() => {
                        resolve(wallet);
                    })
                    .catch((error) => {
                        reject(error);
                    });
                })
                .catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    return {
        key: 'trustwallet',
        name: 'Trust Wallet',
        type: 'mobile',
        connect,
        deepLink: "https://link.trustwallet.com/open_url?coin_id=60&url=",
        download: 'https://trustwallet.com/download'
    }
}