/**
 * This example will use its app key as a signing key, and sign anything it is asked to.
 */

const ethers = require('ethers');
const { MerkleTree } = require('merkletreejs');

/*
 * The `wallet` API is a superset of the standard provider,
 * and can be used to initialize an ethers.js provider like this:
 */
const provider = new ethers.providers.Web3Provider(wallet);

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  console.log('received request', requestObject);
  const privKey = await wallet.request({
    method: 'snap_getAppKey',
  });
  console.log(`privKey is ${privKey}`);
  const ethWallet = new ethers.Wallet(privKey, provider);
  console.dir(ethWallet);

  switch (requestObject.method) {
    case 'address':
      return ethWallet.address;

    case 'signMessage': {
      const message = requestObject.params[0];
      console.log('trying to sign message', message);
      return ethWallet.signMessage(message);
    }

    case 'sign': {
      const transaction = requestObject.params[0];
      return ethWallet.sign(transaction);
    }

    case 'decrypt': {
      const decryptedData = await wallet.request({
        method: 'eth_decrypt',
        params: [requestObject.params[0], requestObject.params[1]],
      });

      const json = JSON.parse(decryptedData);
      console.log(json);
      const { imgCID, ...personalData } = json;
      console.log(personalData);
      const leaves = Object.entries(personalData).map(([key, value]) => {
        return ethers.utils.sha256(
          ethers.utils.toUtf8Bytes(`${key}:${value.toString().toUpperCase()}`),
        );
      });
      await wallet.request({
        method: 'snap_confirm',
        params: [{
          prompt: 'Share Discrete Data',
          description: `Provide Merkle Proof that ${requestObject.params[2]}`
        }]
      })
      const tree = new MerkleTree(leaves, ethers.utils.sha256);
      const proof = tree.getProof(
        ethers.utils.sha256(
          ethers.utils.toUtf8Bytes(`${requestObject.params[2]}`),
        ),
      );
      return proof;
    }

    default:
      throw new Error('Method not found.');
  }
});
