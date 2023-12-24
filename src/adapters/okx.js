const switcher = require('./switcher.js');

module.exports = (provider) => {

    const wallet = window?.okxwallet;

    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.request({ method: 'eth_requestAccounts' })
                .then(async () => {
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
        key: 'okx',
        name: 'Okx Wallet',
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        deepLink: 'okx://wallet/dapp/details?dappUrl={siteUrl}',
        download: 'https://www.okx.com/download',
        isDetected : () => Boolean(window?.okxwallet?.isOkxWallet),
    }
}