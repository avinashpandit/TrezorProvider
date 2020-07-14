import trezorProvider from '../TrezorProvider';

async function main() {
    if(!trezorProvider.initialized)
    {
        // initialize first 
        await trezorProvider.init(true, false);
    }

    console.log(`Trezor Connected ${trezorProvider.connected}`);

    const account = await trezorProvider.getAccount(0);

    console.log(`Trezor Connected ${trezorProvider.connected}`);

    const transaction = trezorProvider.createTransaction('NCSHSKCECOYAMFLX4QG6RMFBD5AOVE2ZN2IWII2R' , 10 , '1001');
    const signedTransaction = await trezorProvider.signTransaction(transaction , account);
    console.log(`SignedTransaction : ${JSON.stringify(signedTransaction)}`);
    //broadcastTransaction

    const response = await trezorProvider.broadcastTransaction(signedTransaction);
    console.log(`BroadcastTransaction : ${JSON.stringify(response)}`);
    
}

main();
  
process.on('uncaughtException', function (exception) {
    console.log(exception); // to see your exception details in the console
});