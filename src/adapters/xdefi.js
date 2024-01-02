const switcher = require('./switcher.js');

module.exports = (provider) => {
    
    const wallet = window.xfi?.ethereum;

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
        key: 'xdefi',
        name: 'Xdefi Wallet',
        supports: [
            'browser',
        ],
        connect,
        download: 'https://www.xdefi.io/',
        isDetected: () => Boolean(window.xfi?.ethereum)
    }
}