const axios = require('axios');
const{ Connection, clusterApiUrl } = require('@solana/web3.js');

class listen {
    constructor() {
        this.wallets = [];
    }

    __init() {
        const connection = new Connection(clusterApiUrl('devnet'),'confirmed'); 
        connection.onSignature((data) => {
            if(data.e_.type = 349) {
                this.wallets.remove(data.e_.address);
            }
            if(data.e_.type != 329) return;
            this.wallets.push(data.e_.address);
        })

        console.log('listening...')
    }

    async __get_last_100(tokenAddress, totalNumberOfHolder) {
        let amount = "0.0001"
        let limit = 100, offset = 0, currentNumber = 0
    
        
        for (let i = 0; i < 100; i ++) {
            let url = `https://public-api.solscan.io/token/holders?tokenAddress=${tokenAddress}&limit=${limit}&offset=${offset}`
            try {
                let response = await axios(url, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                    }
                })
                let data = response.data.data
                for (let j = 0; j < data.length; j ++) {
                    
                    let isInvalid = await this.isInvalidAddress(data[j].owner)
                 
                    if (isInvalid) {
                        continue
                    }
                    let output = data[j].owner + ',' + amount + '\n'
                    this.wallets.push(output);
                    currentNumber ++
                }
                offset += limit
            } catch (e) {
                console.log(e)
            }
        }
        console.log('')
    }

    async isInvalidAddress(account) {
        let url = `https://public-api.solscan.io/account/${account}`
        try {
            let response = await axios(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                }
            })
            let data = response.data
            if (data?.type == "system_account") {
                return false
            }
            else {
                return true
            }
        } catch (e) {
            return true
        }
    }
}

module.exports = listen;