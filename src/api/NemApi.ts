import { Transaction, TransactionHttp, TransferTransaction , AccountHttp , ConfirmedTransactionListener, ChainHttp, PlainMessage, AccountInfoWithMetaData} from 'nem-library';
import { TrezorAccount } from '../trezor-account';
import { map } from 'rxjs/operators';
import { TransactionMessage } from '../index';
import {Address} from "nem-library";
import {BigNumber} from "bignumber.js";

class NemApi {

    public transactionHttp : TransactionHttp;
    constructor() {
        this.transactionHttp = new TransactionHttp();
    }

    //only returns latest 10 transactions
    async getTransactions(addr : string) {
        console.log(`Getting txs for NEM Account ${addr} `);
        const address = new Address(addr);

        const incomingTransactions = await new AccountHttp().incomingTransactions(address).toPromise() ;
        const data = {txs : []}
        for(const txGeneric of incomingTransactions)
        {
            const txn = this.getTransactionMessage(txGeneric);
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

            transaction.received_at = tx.timeWindow.timeStamp.toString();
            const xem = tx.xem();

            const message : PlainMessage = <PlainMessage> tx.message ;
            transaction.metadata = {symbol : 'XEM' , value : xem.quantity , message : message ? message.plain() : ''};
            transaction.status = 'completed';

            return transaction;
        }
        return undefined;
    }

    async getCurrentBlock() {
        return await new ChainHttp().getBlockchainHeight().toPromise();
    }


    async getAccountBalance(addr: string){
        console.log(`Getting txs for NEM Account ${addr} `);
        const address = new Address(addr);

        const accountInfo : AccountInfoWithMetaData = await new AccountHttp().getFromAddress(address).toPromise();
        if(accountInfo && accountInfo.balance){
            const balance = accountInfo.balance.balance;
            
            return new BigNumber(balance);
        }
        else{
            return new BigNumber(0);
        }
    }


    getConfirmedTransactionsObserver(addr : string)
    {
        const address = new Address(addr);
        const confirmedTxListener = new ConfirmedTransactionListener().given(address);
        return confirmedTxListener.pipe(map(txGeneric => this.getTransactionMessage(txGeneric)));
    }

    getConfirmedTransactionsGenericObserver(addr : string)
    {
        const address = new Address(addr);
        return new ConfirmedTransactionListener().given(address);
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

const nemapi = new NemApi();
export default nemapi;