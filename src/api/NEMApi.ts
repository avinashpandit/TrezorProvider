import { Transaction, TransactionHttp, TransferTransaction , AccountHttp , ConfirmedTransactionListener, ChainHttp} from 'nem-library';
import { TrezorAccount } from '../trezor-account';
import { map } from 'rxjs/operators';

type TransactionMessage = {
    id : string;
    from?: string;
    to: string;
    block? : number;
    confirmations: number;
    received_at? : number;
    metadata? : {value : number , symbol : string , message : string};
}

class NEMApi {

    public transactionHttp : TransactionHttp;
    constructor() {
        this.transactionHttp = new TransactionHttp();
    }

    //only returns latest 10 transactions
    async getTransactions(address) {
        const self = this;
        console.log(`Getting txs for NEM Account ${address} `);
        const incomingTransactions = await new AccountHttp().incomingTransactions(address).toPromise() ;
        const data = {txs : []}
        for(const txGeneric of incomingTransactions)
        {
            const txn = self.getTransactionMessage(txGeneric);
            data.txs.push(txn);
        }
        return data;
    }

    getTransactionMessage(txGeneric : Transaction): TransactionMessage
    {
        if(txGeneric && txGeneric.type === 257){
            const tx : TransferTransaction = <TransferTransaction> txGeneric;
            const txInfo = tx.getTransactionInfo();
            const transaction : TransactionMessage = {id : txInfo.hash.data , block : txInfo.height , confirmations : 1 , to: tx.recipient.plain()};
            
            const signer = tx.signer;
            if(signer && signer.address) 
            {
                transaction.from = signer.address.plain();
            }

            //transaction.received_at = tx.timeWindow.timeStamp.toString();
            const xem = tx.xem();
            transaction.metadata = {symbol : 'XEM' , value : xem.amount , message : tx.message.payload};
            console.log(tx);
            return transaction;
        }
        return undefined;
    }

    async getCurrentBlock() {
        return await new ChainHttp().getBlockchainHeight().toPromise();
    }


    getConfirmedTransactionsObserver(address)
    {
        const self = this;
        const confirmedTxListener = new ConfirmedTransactionListener().given(address);
        return confirmedTxListener.pipe(map(txGeneric => self.getTransactionMessage(txGeneric)));
    }

    async getAccount(index : number) : Promise<TrezorAccount>
    {
        return await TrezorAccount.getAccountPromise(index);
    }

    async broadcastTransaction(tx) {
        return await this.transactionHttp.announceTransaction(tx).toPromise();
    }

    async getEstimatedFees()
    {
        return 0;
    }
}

const nemapi = new NEMApi();
export default nemapi;