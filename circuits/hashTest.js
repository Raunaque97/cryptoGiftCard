const circomlib = require("circomlibjs");
const ffj = require("ffjavascript");
const snarkjs = require("snarkjs");
const fs = require("fs");
const crypto = require("crypto");

const { exit } = require("process");

const fromHexString = (hexString) =>
  new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
const toDecimalString = (bytes) => BigInt("0x" + toHexString(bytes)).toString();

const secret = crypto.randomBytes(32);

// sign message
(async () => {
  const poseidon = await circomlib.buildPoseidon();
  let msg = poseidon([1, 2]);
  console.log("hash [1]: ", poseidon.F.toString(msg));

  msg = poseidon(["1", "2"]);
  console.log("hash [1]: ", poseidon.F.toString(msg));

  msg = poseidon([1n, 2n]);
  console.log("hash [1]: ", poseidon.F.toString(msg));

  exit(0);
})();
