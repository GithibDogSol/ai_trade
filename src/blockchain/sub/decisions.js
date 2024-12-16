const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

class decisions {
    constructor(wallets, network = 'mainnet-beta') {
        this.connection = new Connection(network === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com', 'confirmed');
        this.wallets = wallets;
    }

    __init() {
        console.log('ready to think...')
    }

    async getTokenAccounts(publicKey) {
        const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        new PublicKey(publicKey),
            {
                programId: TOKEN_PROGRAM_ID
            }
        );
        return tokenAccounts.value;
    }

    async getTokens(publicKey) {
        try {
        const tokenAccounts = await this.getTokenAccounts(publicKey);
        
        if (tokenAccounts.length === 0) {
            return [];
        }
        
        const tokens = [];
        
        for (let account of tokenAccounts) {
            const { account: tokenData } = account;
            const tokenAmount = tokenData.data.parsed.info.tokenAmount;
            
            tokens.push({
            token: account.account.data.parsed.info.mint,
            amount: tokenAmount.uiAmount
            });
        }
        
        return tokens;
        } catch (error) {
            console.error('Error fetching tokens:', error);
            return [];
        }
    }


    async decideWhatToBuy(wallets) {
        const tokenData = {};


        for (const wallet of wallets) {
            const tokens = await this.getTokens(wallet);
            for (let token of tokens) {
                if (!tokenData[token.token]) {
                tokenData[token.token] = { count: 0, totalAmount: 0 };
                }
                tokenData[token.token].count++;
                tokenData[token.token].totalAmount += token.amount;
            }
        }


        const tokenScores = Object.keys(tokenData).map(token => {
            const { count, totalAmount } = tokenData[token];

            const score = count * 0.6 + totalAmount * 0.4;
            return { token, score };
        });


        tokenScores.sort((a, b) => b.score - a.score);


        const recommendedTokens = tokenScores.map(item => ({
            token: item.token,
            score: item.score
        }));

        return recommendedTokens;
    }
}

module.exports = decisions;