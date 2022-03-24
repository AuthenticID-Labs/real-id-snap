/**
 * This example will use its app key as a signing key, and sign anything it is asked to.
 */

const ethers = require('ethers');
const { MerkleTree } = require('merkletreejs');
const { decrypt } = require('@metamask/eth-sig-util');

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
  decrypt(data, privKey);
  switch (requestObject.method) {
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
      const tree = new MerkleTree(leaves, ethers.utils.sha256);

      await wallet.request({
        method: 'snap_confirm',
        params: [{
          prompt: 'Share Discrete Data',
          description: `Provide Merkle Proof: ${requestObject.params[2].join(', ')}`
        }]
      });

      const proofs = await Promise.all(requestObject.params[2].map(async(toProve) => {
        
        const proof = tree.getProof(
          ethers.utils.sha256(
            ethers.utils.toUtf8Bytes(toProve),
          ),
        );
        return proof;
        }));
      return proofs;
    }

    default:
      throw new Error('Method not found.');
  }
});
