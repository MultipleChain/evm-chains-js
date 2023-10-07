const switcher = require('./switcher.js');

module.exports = (provider) => {

    const wallet = window?.ethereum?.isTrust ? window.ethereum : window.trustwallet;

    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.request({ method: 'eth_requestAccounts' })
                .then(async () => {

                    if (window?.ethereum?.isTrust && provider.testnet) {
                        return resolve(wallet);
                    }

                    switcher(wallet, provider)
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
        detected : Boolean(window?.ethereum?.isTrust || window?.trustwallet)
    }
}