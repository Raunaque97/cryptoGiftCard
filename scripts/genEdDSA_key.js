const circomlib = require("circomlibjs");
const crypto = require("crypto");

const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

// Create a new Ed25519 key pair
(async () => {
  const eddsa = await circomlib.buildEddsa();
  const privateKey = crypto.randomBytes(32);

  const A = eddsa.prv2pub(privateKey);

  // Public Key
  console.log("Ax: ", BigInt("0x" + toHexString(A[0])).toString());
  console.log("Ay: ", BigInt("0x" + toHexString(A[1])).toString());
  // Private Key
  console.log("EdDSA_Private_Key: ", privateKey.toString("hex"));
})();
