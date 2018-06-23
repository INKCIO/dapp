import web3 from 'web3';
import * as express from 'express';
import axios from 'axios';

const etherscanTokens = ['NPRER5JN5UFNKCBICQJD9G2PB9URD17GAZ', '2V12CZFU9PJ9K5WEBJGKHKWBR35PF8H3ZM', 'NRHQIW551DNQZ14JJHAY392PEDI731KFTY'];
const eos = '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0';
let geth: web3;

export const router = express.Router();

export function initRPC(addr: string) {
    geth = new web3(new web3.providers.HttpProvider(addr));
}

type Tx = {
    hash: string,
    blockHeight: number,
    timestamp: number,
    from: string,
    to: string,
    value: number,
    gasLimit: number,
    gasUsed: number,
    gasPrice: number,
};

router.get('/:addr/balance', async (req, res) => {
    let { addr } = req.params;
    let balance = 0;

    try { balance = await geth.eth.getBalance(addr); } catch{ }
    res.json(balance);
});

router.get('/:addr/txs', async (req, res) => {
    let { addr } = req.params;
    addr = addr.startsWith('0x') ? addr : '0x' + addr;

    let apis = [fetchEtherscanTxs, fetchEtherchainTxs];
    for (let api of apis) {
        let txs = await api(addr);
        if (txs.length === 0) continue;
        res.json(txs);
        return;
    }

    res.json([]);
});


export async function fetchEtherscanTxs(addr: string): Promise<Tx[]> {
    let url = `https://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=999999999999&sort=desc&apikey=${etherscanTokens[Date.now() % 3]}`;
    let resp = await axios.get(url);
    if (!resp.data) return [];
    
    let payload = resp.data as { status: string, message: string, result: { value: string, blockNumber: string, timeStamp: string, hash: string, nonce: string, blockHash: string, transactionIndex: string, from: string, to: string, gas: string, gasPrice: string, isError: string, input?: string, cumulativeGasUsed: string, gasUsed: string }[] };
    if (payload.status !== '1') return [];

    return payload.result.map(i => {
        return {
            hash: i.hash,
            blockHeight: Number.parseInt(i.blockNumber),
            timestamp: Number.parseInt(i.timeStamp) * 1000,
            from: i.from,
            to: i.to,
            value: Number.parseInt(i.value),
            gasLimit: Number.parseInt(i.gas),
            gasUsed: Number.parseInt(i.gasUsed),
            gasPrice: Number.parseInt(i.gasPrice),
        }
    });
}

export async function fetchEtherchainTxs(addr: string): Promise<Tx[]> {
    let url = `https://etherchain.org/api/account/${addr}/tx/0`;
    let resp = await axios.get(url);
    if (!resp.data) return [];
    let payload = resp.data as { status: number, data: { hash: string, sender: string, recipient: string, accountNonce: string, price: number, gasLimit: number, amount: number, block_id: number, time: string, gasUsed: number, blockHash: string }[] };
    if (payload.status != 1) return [];

    return payload.data.map(i => {
        return {
            hash: i.hash,
            blockHeight: i.block_id,
            timestamp: Date.parse(i.time),
            from: i.sender,
            to: i.recipient,
            value: i.amount,
            gasLimit: i.gasLimit,
            gasUsed: i.gasUsed,
            gasPrice: i.price,
        }
    });
}