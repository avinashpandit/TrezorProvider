import { Transaction } from "nem-library";
import {BigNumber} from "bignumber.js";
import {SignedTransaction} from "nem-library";

export declare abstract class Bridge {

    isRecipientValid(currency : string , recipient: string ) : boolean ;
  
    createTransaction(recipient: string, amount: BigNumber , source : string , tag: string, fees : BigNumber ) : Promise<Transaction>;
  
    serializeTransaction(t: Transaction, nonce: string) : string;
  
    signTransaction(transport : any , ccy : string, dvPath : string, t : Transaction, nonce : string) : Promise<SignedTransaction>;
}
  
export declare abstract class API {
    broadcastTransaction(tx : Transaction) : string;

    getEstimatedFees(): number;
}

export declare type TransactionMessage = {
    id : string;
    from?: string;
    to: string;
    block? : number;
    confirmations: number;
    received_at? : string;
    status? : string;
    metadata? : {value : number , symbol : string , message : string};
}
