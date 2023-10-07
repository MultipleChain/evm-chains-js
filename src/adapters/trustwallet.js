module.exports = (provider) => {

    const wallet = window.trustWallet;

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
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        download: 'https://trustwallet.com/download',
        detected : Boolean(window?.trustWallet?.isTrust)
    }
}