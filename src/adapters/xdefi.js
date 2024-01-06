module.exports = () => {
    
    const wallet = window?.xfi?.ethereum;

    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.request({ method: 'eth_requestAccounts' })
                .then(async () => {
                    resolve(wallet);
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