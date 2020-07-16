import * as Trezor from "./trezor";
import { TrezorAccount } from './trezor-account';
import { TRANSPORT_EVENT,  TRANSPORT , DEVICE_EVENT , DEVICE} from "trezor-connect";
import TrezorConnect from "trezor-connect";

import nembridge from './bridge/NemBridge';
import nemapi from './api/NemApi';

class TrezorProvider {
    public initialized: boolean;
    public connected: boolean;
    
    // 0. This function will bootstrap both the internal nem-library for nem-trezor and the local one
    // if the local version of nem-library and the one in nem-trezor don't match then this will give problems
    constructor() {
        
        this.initialized = false;
        this.connected = false;
    }

    async init(debug : boolean , lazyLoad : boolean) {
        try
        {
            const self = this;
            if(!this.initialized){    
                await Trezor.initializeTrezor(debug , lazyLoad);     
                this.initialized = true;
                
                // Listen to TRANSPORT_EVENT
                TrezorConnect.on(TRANSPORT_EVENT, event => {
                    if (event.type === TRANSPORT.ERROR) {
                        // trezor-bridge not installed
                        self.connected = false;
                        console.error('Unable to aquire transport. Please check USB connection or see if Trezor Bridge running.')
                    }
                    if (event.type === TRANSPORT.START) {
                        self.connected = true;
                        console.error('Trezor Connected !!!');
                    }
                });

                // Listen to DEVICE_EVENT
                TrezorConnect.on(DEVICE_EVENT, event => {
                    console.log(`Device Event ${event.type}`);
                    if(event.type == DEVICE.CONNECT)
                    {
                        self.connected = true;
                    }
                    else if(event.type == DEVICE.DISCONNECT){
                        self.connected = false;    
                    }
                });

            }
        }
        catch(error){
            console.error('Error in Trezor.initialize ' , error);    
        } 
    }

    async getAPI(ccy : string)
    {
        console.log(`Calling getAPI ${ccy}`);
        if(ccy === 'XEM')
        {
            return nemapi; 
        }

        return undefined;
    }

    async getBridge(ccy : string)
    {
        console.log(`Calling getBridge ${ccy}`);
        if(ccy === 'XEM')
        {
            return nembridge; 
        }

        return undefined;
    }
    
    async getAccount(index : number) : Promise<TrezorAccount>
    {
        return  await TrezorAccount.getAccountPromise(index);
    }
}

const trezorProvider = new TrezorProvider();

export default trezorProvider;
