import * as Trezor from "./trezor";
import { Observable } from "rxjs";
import {
  Transaction, SignedTransaction,
  NEMLibrary
} from "nem-library";

/**
 * TrezorAccount model
 */
export class TrezorAccount {
  public readonly hdKeyPath: string;

  /**
   * Constructor
   * @param address
   */
  constructor(hdKeyPath: string) {
    this.hdKeyPath = hdKeyPath;
  }

  /**
   * Sign a transaction
   * @param transaction
   * @param receiverPublicKey (optional): if given, the message will be encrypted
   * @returns {{data: any, signature: string}}
   */
  public signTransaction(transaction: Transaction): Observable<SignedTransaction> {
    //transaction.signer = PublicAccount.createWithPublicKey("462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce");
    transaction.setNetworkType(NEMLibrary.getNetworkType());
    const dto: any = transaction.toDTO();
    const serialized = Observable.fromPromise(Trezor.serialize(dto, this.hdKeyPath));
    return serialized.map((serializedTransaction) => {
      return (serializedTransaction as SignedTransaction);
    });
  }

  public async signTransactionPromise(transaction: Transaction): Promise<SignedTransaction> {
    //transaction.signer = PublicAccount.createWithPublicKey("462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce");
    transaction.setNetworkType(NEMLibrary.getNetworkType());
    const dto: any = transaction.toDTO();
    const serialized = await Trezor.serialize(dto, this.hdKeyPath);
    return (serialized as SignedTransaction);
  }

  private async signSerialTransactionsPromise(transactions: Transaction[]): Promise<SignedTransaction[]> {
    const dtos = transactions.map(t => {
      //t.signer = PublicAccount.createWithPublicKey("462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce");
      t.setNetworkType(NEMLibrary.getNetworkType());
      return t.toDTO();
    });
    const signedTransactions: SignedTransaction[] = [];
    for (let i = 0; i < transactions.length; i++) {
      const keepSession = (i < transactions.length - 1);
      const serialized = await Trezor.serialize(dtos[i], this.hdKeyPath, keepSession);
      signedTransactions.push(serialized as SignedTransaction);
    }
    return signedTransactions;
  }

  public signSerialTransactions(transactions: Transaction[]): Observable<SignedTransaction[]> {
    return Observable.fromPromise(this.signSerialTransactionsPromise(transactions));
  }

  /**
   * generate new account
   * @param walletName
   * @param passphrase
   * @param networkType
   * @returns {Account}
   */
  public static getAccount(index: number): Observable<TrezorAccount> {
    return Observable.fromPromise(Trezor.createAccount(NEMLibrary.getNetworkType(), index))
      .map((account: any) => {
        return new TrezorAccount(account.hdKeypath);
      });
  }

  public static async getAccountPromise(index: number): Promise<TrezorAccount> {
    const account = await Trezor.createAccount(NEMLibrary.getNetworkType(), index);
    return new TrezorAccount(account.hdKeypath);
  }

}
