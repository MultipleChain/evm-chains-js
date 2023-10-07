module.exports = () => {
    const wallet = window.BinanceChain;
    const connect = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                wallet.request({ method: 'eth_requestAccounts' })
                .then(() => {
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
        key: 'binancewallet',
        name: 'Binance Wallet',
        supports: [
            'browser'
        ],
        connect,
        download: 'https://chrome.google.com/webstore/detail/binance-wallet/fhbohimaelbohpjbbldcngcnapndodjp',
        detected : Boolean(window?.BinanceChain?.bnbSign)
    }
}