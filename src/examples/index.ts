import {  TransferTransaction,
    Address, PlainMessage , RepositoryFactoryHttp , Deadline , NetworkType , UInt64} from 'symbol-sdk';
import { TrezorAccount } from '../trezor-account';
import { flatMap } from 'rxjs/operators';
 
// 0. This function will bootstrap both the internal nem-library for nem-trezor and the local one
// if the local version of nem-library and the one in nem-trezor don't match then this will give problems
const nodeUrl = 'http://alice6.nem.ninja:7890';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

const rawAddress = 'NCSHSKCECOYAMFLX4QG6RMFBD5AOVE2ZN2IWII2R';
const recipientAddress = Address.createFromRawAddress(rawAddress);
const networkType = NetworkType.MAIN_NET;

// 1. Get the first account of the trezor device. Change the number for different accounts. This will prompt a confirmation on the device.
TrezorAccount.getAccount(0)
  .pipe(flatMap((account) => {
    console.log(account);
    // 2. Create Transaction object
    // For more information on Transaction types and their usage check out the nem-library documentation
    const trans = TransferTransaction.create(
      Deadline.create(),
      recipientAddress,
      [],
      PlainMessage.create('1001'),
      networkType,
      UInt64.fromUint(1000000));

    // 3. Sign and serialize the transaction from the trezor device. This will prompt for confirmation on the device.
    return account.signTransaction(trans);
  }))
  // Announce the transaction to the network
  .pipe(flatMap((signedTransaction) => transactionHttp.announce(signedTransaction)))
  // Print the response
  .subscribe((response) => console.log(response), (err) => console.error(err));
