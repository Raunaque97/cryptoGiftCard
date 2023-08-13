const circomlib = require("circomlibjs");
const crypto = require("crypto");
const ffj = require("ffjavascript");

const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

// Create a new Ed25519 key pair
(async () => {
  const eddsa = await circomlib.buildEddsa();
  const privateKey = crypto.randomBytes(32);

  const A = eddsa.prv2pub(privateKey);
  const Ax = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(A[1]), 32);
  const Ay = ffj.utils.leBuff2int(eddsa.F.fromMontgomery(A[0]), 32);
  // Private Key
  console.log("EdDSA_Private_Key: ", privateKey.toString("hex"));
  // Public Key
  console.log("Ax: ", Ax.toString());
  console.log("Ay: ", Ay.toString());

  console.log("Ax_hex: ", Ax.toString(16));
  console.log("Ay_hex: ", Ay.toString(16));
})();
