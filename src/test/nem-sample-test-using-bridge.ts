import trezorProvider from '../TrezorProvider';
import {BigNumber} from "bignumber.js";

async function main() {

    const ccy = 'XEM';
    if(!trezorProvider.initialized)
    {
        // initialize first 
        await trezorProvider.init(false, false);
    }

    console.log(`Trezor Connected ${trezorProvider.connected}`);

    //get bridge and api for NEM 
    const api = await trezorProvider.getAPI(ccy);
    const bridge = await trezorProvider.getBridge(ccy);


    const address = "NCSHSKCECOYAMFLX4QG6RMFBD5AOVE2ZN2IWII2R";
    const address1 = "NDJ2RKOKF632IOJR7NW7EEBCBYU4ICMYZH25M4WH";
    const address2 = 'NB4L7JE3FENQPYLSA2T4GH6P7K43SH6WYIFDZ3QY';
    
    /*
    const incomingTransactionsListener = new AccountHttp().incomingTransactions(address );
    incomingTransactionsListener.subscribe(x => {
        console.log(`Incoming TX ${x}`);
        console.log(x);
    }, err => {
        console.log(err);
    });
*/
    //promise version 
    /*
    const unconfirmedTxListener = new UnconfirmedTransactionListener().given(address);
    unconfirmedTxListener.subscribe(x => {
        console.log(`Unconfirmed TX ${x}`);
        console.log(x);
    }, err => {
        console.log(err);
    });

    const confirmedTxListener = new ConfirmedTransactionListener().given(address);
    confirmedTxListener.subscribe(x => {
        console.log(`Confirmed TX ${x}`);
        console.log(x);
    }, err => {
        console.log(err);
    });
    */

    if(api && bridge)
    {
        console.log(`Trezor Connected ${trezorProvider.connected}`);
        const data = await api.getTransactions(address2);
        for(const tx of data.txs)
        {
            console.log(tx);
        }

        const txListener = api.getConfirmedTransactionsObserver(address);
        txListener.subscribe(tx => {
            console.log(tx);
        });

        const txListener1 = api.getConfirmedTransactionsObserver(address2);
        txListener1.subscribe(tx => {
            console.log(tx);
        });

        const transaction = await bridge.createTransaction('NCSHSKCECOYAMFLX4QG6RMFBD5AOVE2ZN2IWII2R' , new BigNumber(1) , 'testsource-account' , '7013' , undefined);
        const signedTransaction = await bridge.signTransaction(transaction , 0 , undefined);
        console.log(`SignedTransaction : ${JSON.stringify(signedTransaction)}`);
        //broadcastTransaction
    
        const response = await api.broadcastTransaction(signedTransaction);
        console.log(`BroadcastTransaction : ${JSON.stringify(response)}`);
        
    }
    else{
        console.error('Unable to get bridge or api for NEM');
    }

}

main();
  
process.on('uncaughtException', function (exception) {
    console.log(exception); // to see your exception details in the console
});