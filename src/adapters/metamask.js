module.exports = metaMask = (provider) => {
    
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
        type: 'browser',
        connect,
        deepLink: 'https://provider.app.link/dapp/',
        download: 'https://metamask.io/download/'
    }
}