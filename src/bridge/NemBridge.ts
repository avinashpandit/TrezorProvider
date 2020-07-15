import { TrezorAccount } from '../trezor-account';
import { NEMLibrary, NetworkTypes, Transaction, TransferTransaction,
    TimeWindow, XEM, Address, PlainMessage } from 'nem-library';
import {BigNumber} from "bignumber.js";
import {SignedTransaction} from "nem-library";
import Bridge from "./Bridge";

class NemBridge extends Bridge
{

  constructor() {
    super();
    NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
  }

  isRecipientValid(currency : string, recipient: string) : boolean {
    return true;
  }

  async createTransaction(recipient: string, amount: BigNumber , source : string , tag: string, fees : BigNumber ) {
    const trans: Transaction = TransferTransaction.create(
        TimeWindow.createWithDeadline(),
        new Address(recipient),
        new XEM(amount.toNumber()),
        PlainMessage.create(tag),
    );

    return trans;
  }

  serializeTransaction(t, nonce: string) {
    return t;
  }

  async signTransaction( t , sourceAccountIndex : number , nonce : string) : Promise<SignedTransaction>{
    const account = await TrezorAccount.getAccountPromise(sourceAccountIndex);
    const serializedTx = this.serializeTransaction(t , nonce);
    const result = await account.signTransactionPromise(serializedTx);
    
    return result;
  }

}

const nembridge = new NemBridge();
export default nembridge;