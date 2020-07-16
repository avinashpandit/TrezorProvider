import * as Trezor from "./trezor";
import { Observable } from "rxjs/observable";
import {
  Transaction, SignedTransaction , NetworkType, TransactionType
} from 'symbol-sdk';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { map } from 'rxjs/operators';

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
    const dto: any = transaction.serialize();
    const serialized = fromPromise(Trezor.serialize(dto, this.hdKeyPath));
    return serialized.pipe(map((serializedTransaction) => {
      const signedTransaction = new SignedTransaction(serializedTransaction.data , serializedTransaction.signature , undefined , TransactionType.TRANSFER , NetworkType.MAIN_NET)
      return signedTransaction;
    }));
  }

  public async signTransactionPromise(transaction: Transaction): Promise<SignedTransaction> {
    //transaction.signer = PublicAccount.createWithPublicKey("462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce");
    const dto: any = transaction.serialize();
    const serializedTransaction = await Trezor.serialize(dto, this.hdKeyPath);
    const signedTransaction = new SignedTransaction(serializedTransaction.data , serializedTransaction.signature , undefined , TransactionType.TRANSFER , NetworkType.MAIN_NET)
    return signedTransaction;
  }

  private async signSerialTransactionsPromise(transactions: Transaction[]): Promise<SignedTransaction[]> {
    const dtos = transactions.map(t => {
      //t.signer = PublicAccount.createWithPublicKey("462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce");
      return t.serialize();
    });
    const signedTransactions: SignedTransaction[] = [];
    for (let i = 0; i < transactions.length; i++) {
      const keepSession = (i < transactions.length - 1);
      const serializedTransaction = await Trezor.serialize(dtos[i], this.hdKeyPath, keepSession);
      const signedTransaction = new SignedTransaction(serializedTransaction.data , serializedTransaction.signature , undefined , TransactionType.TRANSFER , NetworkType.MAIN_NET)
      signedTransactions.push(signedTransaction);
    }
    return signedTransactions;
  }

  public signSerialTransactions(transactions: Transaction[]): Observable<SignedTransaction[]> {
    return fromPromise(this.signSerialTransactionsPromise(transactions));
  }

  /**
   * generate new account
   * @param walletName
   * @param passphrase
   * @param networkType
   * @returns {Account}
   */
  public static getAccount(index: number): Observable<TrezorAccount> {
    return fromPromise(Trezor.createAccount(NetworkType.MAIN_NET, index)).pipe(
      map((account: any) => {
        return new TrezorAccount(account.hdKeypath);
      }));
  }

  public static async getAccountPromise(index: number): Promise<TrezorAccount> {
    const account = await Trezor.createAccount(NetworkType.MAIN_NET, index);
    return new TrezorAccount(account.hdKeypath);
  }

}
