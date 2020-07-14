import { TransactionHttp } from 'nem-library';
import { TrezorAccount } from '../trezor-account';

class NEMApi {

    public transactionHttp : TransactionHttp;
    constructor() {
        this.transactionHttp = new TransactionHttp();
    }

    async getAccount(index : number) : Promise<TrezorAccount>
    {
        return await TrezorAccount.getAccountPromise(index);
    }

    async broadcastTransaction(tx) {
        return await this.transactionHttp.announceTransaction(tx).toPromise();
    }

    async getEstimatedFees()
    {
        return 0;
    }
}

const nemapi = new NEMApi();
export default nemapi;