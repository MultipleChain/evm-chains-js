module.exports = () => {
    
    const wallet = window?.phantom?.ethereum;

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
        key: 'phantom',
        name: 'Phantom',
        supports: [
            'browser',
            'mobile'
        ],
        connect,
        deepLink: 'https://phantom.app/ul/browse/{siteUrl}?ref={siteUrl}',
        download: 'https://phantom.app/',
        detected: Boolean(window.phantom?.ethereum)
    }
}