import TrezorConnect from "trezor-connect";
import { NetworkTypes } from "nem-library";

const initializeTrezor = async (debug : boolean , lazyLoad : boolean) : Promise<void> => {
  return TrezorConnect.init({
    //connectSrc: './assets/trezor-connect/',
    popup: true, // render your own UI
    webusb: true, // webusb is not supported in electron
    debug: debug, // see what's going on inside connect
    lazyLoad: lazyLoad, // set to "false" (default) if you want to start communication with bridge on application start (and detect connected device right away)
    // set it to "true", then trezor-connect will not be initialized until you call some TrezorConnect.method()
    // this is useful when you don't know if you are dealing with Trezor user
    manifest: {
        email: 'avinash.pandit@integral.com',
        appUrl: 'hw-Trezor-Provider',
    },
  });
}

const bip44 = (network: number, index: number) => {
  const coinType = network === -104
    ? 1
    : 43;

  return `m/44'/${coinType}'/${index}'/0'/0'`;
};

const createAccount = async (network: number, index: number) => {
  if (network === NetworkTypes.TEST_NET) {
    network = -104;
  }
  const hdKeypath = bip44(network, index);

  console.log(`Returned Account Number ${hdKeypath}`);
  const result = await TrezorConnect.nemGetAddress({
    path: hdKeypath,
    network, 
    showOnTrezor : false
  });
  if (result.success) {
    return {
      address: result.payload.address,
      hdKeypath: hdKeypath
    };
  } else {
    throw new Error(result.payload['error']);
  }
};

const serialize = async (transaction, hdKeypath, keepSession?) => {
  const result = await TrezorConnect.nemSignTransaction({
    path: hdKeypath,
    transaction,
    keepSession,
  });
  if (result.success) {
    return result.payload;
  } else {
    console.log("error", result);
    throw new Error(result.payload['error']);
  }
};

const showAccount = async (account) => {
  const result = await TrezorConnect.nemGetAddress({
    path: account.hdKeypath,
    network: account.network,
  });
  if (result.success) {
    return result.payload.address;
  } else {
    throw new Error(result.payload['error']);
  }
};

export {
  createAccount, serialize, showAccount, initializeTrezor
};