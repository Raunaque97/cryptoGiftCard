const circomlib = require("circomlibjs");
const crypto = require("crypto");

const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

// Create a new Ed25519 key pair
(async () => {
  const eddsa = await circomlib.buildEddsa();
  const privateKey = crypto.randomBytes(32);

  const A = eddsa.prv2pub(privateKey);

  console.log("Public Key");
  console.log("Ax: ", BigInt("0x" + toHexString(A[0])).toString());
  console.log("Ay: ", BigInt("0x" + toHexString(A[1])).toString());
  // console.log(
  //   "Public Key bin: ",
  //   keyPair
  //     .getPublic("hex")
  //     .match(/.{1,2}/g)
  //     .map((byte) => parseInt(byte, 16))
  // );
  console.log("Private Key Hex: ", privateKey.toString("hex"));
})();
