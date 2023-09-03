module.exports = metamask = (provider) => {
    
    const wallet = window.ethereum;
    const switcher = require('./switcher.js')(wallet, provider);

    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.request({ method: 'eth_requestAccounts' })
                .then(async () => {
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
        key: 'metamask',
        name: 'MetaMask',
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        deepLink: 'https://metamask.app.link/dapp/{siteUrl}',
        download: 'https://metamask.io/download/',
        detected : Boolean(typeof wallet != 'undefined' && wallet.isMetaMask)
    }
}