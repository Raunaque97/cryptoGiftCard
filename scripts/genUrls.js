// usage is `node genUrls.js -n [number of urls] -a [amount]`

require("dotenv").config();
const circomlib = require("circomlibjs");
const crypto = require("crypto");
const ffj = require("ffjavascript");
const fs = require("fs");
const argv = require("minimist")(process.argv.slice(2));

const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
const toDecimalString = (bytes) => BigInt("0x" + toHexString(bytes)).toString();
const fromHexString = (hexString) =>
  new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

if (!argv.n || !argv.a) {
  console.log("Usage: node genUrls.js -n [number of urls] -a [amount]");
  process.exit();
}

// load pvt and pub keys from .env file
if (!process.env.EdDSA_Private_Key) {
  console.log("Generate key pair first");
  process.exit();
}
const privateKey = fromHexString(process.env.EdDSA_Private_Key);
const Ax = fromHexString(process.env.Ax_hex);
const Ay = fromHexString(process.env.Ay_hex);
const baseUrl = process.env.BASE_URL || "http://localhost:5173";

// console.log("privateKey", privateKey);
// console.log("Ax", Ax);
// console.log("Ay", Ay);
console.log("Generating ", argv.n, " urls . . .");

(async () => {
  const poseidon = await circomlib.buildPoseidon();
  const eddsa = await circomlib.buildEddsa();

  // generate n random urls
  for (let i = 0; i < argv.n; i++) {
    const secret = crypto.randomBytes(32);
    const amt = BigInt(argv.a) * BigInt(1e18);

    // calculate hash = poseidon(secret, amount)
    const hash = poseidon.F.toString(poseidon([toDecimalString(secret), amt]));
    const hashBuf = fromHexString(BigInt(hash).toString(16)).slice(0, 12);

    // sign hash
    const { R8, S } = eddsa.signMiMCSponge(
      privateKey,
      eddsa.babyJub.F.e(ffj.Scalar.fromRprLE(hashBuf, 0))
    );

    // console.log(
    //   "verification: " +
    //     eddsa.verifyMiMCSponge(
    //       eddsa.babyJub.F.e(ffj.Scalar.fromRprLE(hashBuf, 0)),
    //       { R8, S },
    //       [Ax, Ay]
    //     )
    // );

    // base64 encode {R8x, R8y, S, sec, a}
    const code = btoa(
      JSON.stringify({
        R8x: toHexString(R8[0]),
        R8y: toHexString(R8[1]),
        S: S.toString(),
        sec: toHexString(secret),
        a: amt.toString(),
      })
    );
    console.log(`${baseUrl}/?code=${code}`);
  }
})();
