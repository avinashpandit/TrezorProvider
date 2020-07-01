// import Trezor = require("./vendor/connect.js");
// let TrezorConnect = Trezor.TrezorConnect();
import TrezorConnect from "trezor-connect";
import { NetworkTypes } from "nem-library";

TrezorConnect.init({
  //connectSrc: './assets/trezor-connect/',
  popup: true, // render your own UI
  webusb: true, // webusb is not supported in electron
  debug: true, // see what's going on inside connect
  lazyLoad: false, // set to "false" (default) if you want to start communication with bridge on application start (and detect connected device right away)
  // set it to "true", then trezor-connect will not be initialized until you call some TrezorConnect.method()
  // this is useful when you don't know if you are dealing with Trezor user
  manifest: {
      email: 'email@developer.com',
      appUrl: 'electron-app-boilerplate',
  },
}).then(() => {
  console.log('TrezorConnect is ready!');
}).catch(error => {
  console.error('Error in TrezorConnect ' , error);
});


// const createWallet = (network) => {
//   return TrezorConnect
//     .createAccount(network, 0, "Primary")
//     .then((account) => ({
//       "name": "TREZOR",
//       "accounts": {
//         "0": account,
//       }
//     }));
// };

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

// TODO: this can be done with the new trezor-connect
// review the encrypt/decrypt logic
// const getPubKey = (path) => {
//   TrezorConnect = Trezor.TrezorConnect();
//   return new Promise((resolve, reject) => {
//     TrezorConnect.getXPubKey(undefined, (pubK) => {
//       resolve(pubK);
//     });
//   });
// };


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
  createAccount, serialize, showAccount,
};
