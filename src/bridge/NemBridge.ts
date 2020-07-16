import { TrezorAccount } from '../trezor-account';
import { NetworkType, Deadline, TransferTransaction,
  UInt64, PlainMessage, Address , Mosaic , MosaicId , } from 'symbol-sdk';
import {BigNumber} from "bignumber.js";
import {SignedTransaction} from 'symbol-sdk';
import Bridge from "./Bridge";

class NemBridge extends Bridge
{

  constructor() {
    super();
  }

  isRecipientValid(currency : string, recipient: string) : boolean {
    return true;
  }

  async createTransaction(recipient: string, amount: BigNumber , source : string , tag: string, fees : BigNumber ) {
    const recipientAddress = Address.createFromRawAddress(recipient);
    const networkCurrencyDivisibility = 6;
    const networkCurrencyMosaicId = new MosaicId('05D6A80DE3C9ADCA');

    const mosaic = [new Mosaic (networkCurrencyMosaicId,
      UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility)))];

    const trans = TransferTransaction.create(
      Deadline.create(),
      recipientAddress,
      mosaic,
      PlainMessage.create(tag),
      NetworkType.MAIN_NET,
      UInt64.fromUint(amount.toNumber()));

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