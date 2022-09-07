const fcl = require("@onflow/fcl");
const { SHA3 } = require("sha3");

var EC = require("elliptic").ec;
const ec = new EC("secp256k1");

require("dotenv").config();

const sign = (message) => {
  const key = ec.keyFromPrivate(Buffer.from(process.env.MY_PRIVATE_KEY, "hex"));
  const sig = key.sign(hash(message)); // hashMsgHex -> hash
  const n = 32;
  const r = sig.r.toArrayLike(Buffer, "be", n);
  const s = sig.s.toArrayLike(Buffer, "be", n);
  return Buffer.concat([r, s]).toString("hex");
};

const hash = (message) => {
  const sha = new SHA3(256);
  sha.update(Buffer.from(message, "hex"));
  return sha.digest();
};

const authorizationFunction = async (account) => {
  return {
    ...account,
    tempId: `${process.env.MY_ADDRESS}-${process.env.ACCOUNT_KEY_ID}`,
    addr: fcl.sansPrefix(process.env.MY_ADDRESS),
    keyId: Number(process.env.ACCOUNT_KEY_ID),
    signingFunction: async (signable) => {
      return {
        addr: fcl.withPrefix(process.env.MY_ADDRESS),
        keyId: Number(process.env.ACCOUNT_KEY_ID),
        signature: sign(signable.message),
      };
    },
  };
};
var KEY_ID_ITERABLE = 0;
const authorizationFunctionProposer = async (account) => {
  if (KEY_ID_ITERABLE >= 5) {
    KEY_ID_ITERABLE = 0;
  } else {
    KEY_ID_ITERABLE++;
  }

  return {
    ...account,
    tempId: `${process.env.MY_ADDRESS}-${KEY_ID_ITERABLE}`,
    addr: fcl.sansPrefix(process.env.MY_ADDRESS),
    keyId: Number(KEY_ID_ITERABLE),
    signingFunction: async (signable) => {
      return {
        addr: fcl.withPrefix(process.env.MY_ADDRESS),
        keyId: Number(KEY_ID_ITERABLE),
        signature: sign(signable.message),
      };
    },
  };
};

module.exports = {
  authorizationFunction,
  authorizationFunctionProposer,
};
