import { NEMLibrary, NetworkTypes, Transaction, TransferTransaction,
    TimeWindow, XEM, Address, TransactionHttp, PlainMessage} from 'nem-library';
import { TrezorAccount } from '../trezor-account';
import { flatMap } from 'rxjs/operators';

// 0. This function will bootstrap both the internal nem-library for nem-trezor and the local one
// if the local version of nem-library and the one in nem-trezor don't match then this will give problems
NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
const transactionHttp = new TransactionHttp();
 
// 1. Get the first account of the trezor device. Change the number for different accounts. This will prompt a confirmation on the device.
TrezorAccount.getAccount(0)
  .pipe(flatMap((account) => {
    console.log(account);
    // 2. Create Transaction object
    // For more information on Transaction types and their usage check out the nem-library documentation
    const trans: Transaction = TransferTransaction.create(
      TimeWindow.createWithDeadline(),
      new Address("NCSHSKCECOYAMFLX4QG6RMFBD5AOVE2ZN2IWII2R"),
      new XEM(10),
      PlainMessage.create("1001"),
    );
    // 3. Sign and serialize the transaction from the trezor device. This will prompt for confirmation on the device.
    return account.signTransaction(trans);
  }))
  // Announce the transaction to the network
  .pipe(flatMap((signedTransaction) => transactionHttp.announceTransaction(signedTransaction)))
  // Print the response
  .subscribe((response) => console.log(response), (err) => console.error(err));
