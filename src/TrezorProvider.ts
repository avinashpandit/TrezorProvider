import * as Trezor from "./trezor";
import { TrezorAccount } from './trezor-account';
import { NEMLibrary, NetworkTypes, Transaction, SignedTransaction, TransferTransaction,
    TimeWindow, XEM, Address, TransactionHttp, PlainMessage , NemAnnounceResult} from 'nem-library';
import { TRANSPORT_EVENT,  TRANSPORT} from "trezor-connect";
import TrezorConnect from "trezor-connect";

class TrezorProvider {
    public initialized: boolean;
    public connected: boolean;
    
    public transactionHttp : TransactionHttp;

    // 0. This function will bootstrap both the internal nem-library for nem-trezor and the local one
    // if the local version of nem-library and the one in nem-trezor don't match then this will give problems
    constructor() {
        NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
        this.initialized = false;
        this.connected = false;
        this.transactionHttp = new TransactionHttp();
    }

    async init() {
        try
        {
            const lazyLoad = false;
            const debug = false;
            if(!this.initialized){    
                await Trezor.initializeTrezor(debug , lazyLoad);     
                this.initialized = true;
                
                // Listen to TRANSPORT_EVENT
                TrezorConnect.on(TRANSPORT_EVENT, event => {
                    if (event.type === TRANSPORT.ERROR) {
                        // trezor-bridge not installed
                        this.connected = false;
                        console.error('Unable to aquire transport. Please check USB connection or see if Trezor Bridge running.')
                    }
                    if (event.type === TRANSPORT.START) {
                        this.connected = true;
                        console.error('Trezor Connected !!!');
                    }
                });

            }
        }
        catch(error){
            console.error('Error in Trezor.initialize ' , error);    
        } 
    }

    async getAccount(index : number) : Promise<TrezorAccount>
    {
        return  await TrezorAccount.getAccountPromise(index);
    }

    createTransaction(address : string, amount : number , memo : string ) : Transaction
    {
        // 2. Create Transaction object
        // For more information on Transaction types and their usage check out the nem-library documentation
        const trans: Transaction = TransferTransaction.create(
            TimeWindow.createWithDeadline(),
            new Address(address),
            new XEM(amount),
            PlainMessage.create(memo),
        );

        return trans;
    }

    async signTransaction(transaction: Transaction , trezorAccount: TrezorAccount ): Promise<SignedTransaction>
    {
        return await trezorAccount.signTransactionPromise(transaction);
    }

    async broadcastTransaction(transaction: SignedTransaction): Promise<NemAnnounceResult>
    {
        return await this.transactionHttp.announceTransaction(transaction).toPromise();
    }
}

const trezorProvider = new TrezorProvider();

export default trezorProvider;
