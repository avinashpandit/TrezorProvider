import { Transaction, TransferTransaction  , RepositoryFactoryHttp, PlainMessage, TransactionHttp, TransactionType, TransactionInfo} from 'symbol-sdk';
import { TrezorAccount } from '../trezor-account';
import { map } from 'rxjs/operators';
import { TransactionMessage } from '../index';
import {Address , TransactionGroup} from 'symbol-sdk';

class NemApi {

    public transactionHttp : TransactionHttp;
    public nodeUrl : string;
    
    constructor() {
        this.nodeUrl = 'http://alice6.nem.ninja:7890';
        const repositoryFactory = new RepositoryFactoryHttp(this.nodeUrl);
        this.transactionHttp = new TransactionHttp(this.nodeUrl);
        
    }

    //only returns latest 10 transactions
    async getTransactions(addr : string) {
        console.log(`Getting txs for NEM Account ${addr} `);
        const address = Address.createFromRawAddress(addr);

        const incomingTransactions = await this.transactionHttp.search({group : TransactionGroup.Confirmed , address , type : [TransactionType.TRANSFER]}).toPromise() ;
        const data = {txs : []}
        for(const txGeneric of incomingTransactions.data)
        {
            const txn = this.getTransactionMessage(txGeneric);
            data.txs.push(txn);
        }
        return data;
    }

    getTransactionMessage(txGeneric : Transaction): TransactionMessage
    {
        if(txGeneric && txGeneric.type === TransactionType.TRANSFER){
            const tx : TransferTransaction = <TransferTransaction> txGeneric;
            const txInfo : TransactionInfo = tx.transactionInfo;
            const transaction : TransactionMessage = {id : txInfo.hash , block : txInfo.height.compact() , confirmations : 1 , to: (<Address>tx.recipientAddress).plain()};
            
            const signer = tx.signer;
            if(signer && signer.address) 
            {
                transaction.from = signer.address.plain();
            }

            transaction.received_at;
            const mosaics = tx.mosaics;

            const message : PlainMessage = <PlainMessage> tx.message ;
            transaction.metadata = {symbol : 'XEM' , value : mosaics[0].amount.compact() , message : message ? message.payload : ''};
            transaction.status = 'completed';

            return transaction;
        }
        return undefined;
    }

    async getCurrentBlock() {
        //return await new ChainHttp().getBlockchainHeight().toPromise();
    }


    getConfirmedTransactionsObserver(addr : string)
    {
//        const address = Address.createFromRawAddress(addr);
  //      const confirmedTxListener = new ConfirmedTransactionListener().given(address);
    //    return confirmedTxListener.pipe(map(txGeneric => this.getTransactionMessage(txGeneric)));
    }

    async getAccount(index : number) : Promise<TrezorAccount>
    {
        return await TrezorAccount.getAccountPromise(index);
    }

    async broadcastTransaction(tx) {
        return await this.transactionHttp.announce(tx).toPromise();
    }

    async getEstimatedFees()
    {
        return 0;
    }
}

const nemapi = new NemApi();
export default nemapi;