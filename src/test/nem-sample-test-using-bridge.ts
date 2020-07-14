import trezorProvider from '../TrezorProvider';
import {BigNumber} from "bignumber.js";

async function main() {
    const ccy = 'NEM';
    if(!trezorProvider.initialized)
    {
        // initialize first 
        await trezorProvider.init(false, false);
    }

    console.log(`Trezor Connected ${trezorProvider.connected}`);

    //get bridge and api for NEM 
    const api = await trezorProvider.getAPI(ccy);
    const bridge = await trezorProvider.getBridge(ccy);

    if(api && bridge)
    {
        console.log(`Trezor Connected ${trezorProvider.connected}`);
        const account = await api.getAccount(0);
        const transaction = await bridge.createTransaction('NCSHSKCECOYAMFLX4QG6RMFBD5AOVE2ZN2IWII2R' , new BigNumber(1) , 'testsource-account' , '1001' , undefined);
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