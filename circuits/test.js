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

const ReceiverAddress = "0x23Fc32698598980c628e8BC6a5DCCf79B2652d73";
//create private key
const privateKey = crypto.randomBytes(32);

// sign message
(async () => {
  const eddsa = await circomlib.buildEddsa();
  const A = eddsa.prv2pub(privateKey);

  const msgBuf = fromHexString("000102030405060708090000");
  const msg = eddsa.babyJub.F.e(ffj.Scalar.fromRprLE(msgBuf, 0));
  const { R8, S } = eddsa.signMiMCSponge(privateKey, msg);
  // verify signature
  // console.log("verification: " + eddsa.verifyMiMCSponge(msg, { R8, S }, A));

  // create input for proof
  const input = {
    Ax: BigInt("0x" + toHexString(A[0])).toString(),
    Ay: BigInt("0x" + toHexString(A[1])).toString(),
    R8x: BigInt("0x" + toHexString(R8[0])).toString(),
    R8y: BigInt("0x" + toHexString(R8[1])).toString(),
    S: S.toString(),
    secret: BigInt("0x" + toHexString(msg)).toString(),
    address: BigInt(ReceiverAddress).toString(),
  };

  // console.log("input:", input);
  // create proof
  // check if the .wasm & .zkey files exist else quit
  if (!fs.existsSync("gift.wasm")) {
    console.log("gift.wasm not found");
    return;
  }
  if (!fs.existsSync("gift.zkey")) {
    console.log("gift.zkey not found");
    return;
  }
  console.log("Creating proof...");
  let time = Date.now();
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "gift.wasm",
    "gift.zkey"
  );
  console.log("Proof created in " + (Date.now() - time) + "ms");
  console.log("Public signals:", publicSignals);

  // verify proof
  console.log("Verifying proof...");
  time = Date.now();
  // get verification key from gift_vk.json
  const verification_key = JSON.parse(
    fs.readFileSync("gift_vk.json").toString()
  );
  const res = await snarkjs.groth16.verify(
    verification_key,
    publicSignals,
    proof
  );
  if (!res) {
    console.log("Invalid proof");
    exit(1);
  }
  console.log("Proof verified in " + (Date.now() - time) + "ms");
  exit(0);
})();
