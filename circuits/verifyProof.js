const circomlib = require("circomlibjs");
const crypto = require("crypto");
const ffj = require("ffjavascript");
const snarkjs = require("snarkjs");
const fs = require("fs");

const { exit } = require("process");

// helpers
const fromHexString = (hexString) =>
  new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
const toHexString = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
const toDecimalString = (bytes) => BigInt("0x" + toHexString(bytes)).toString();

const ReceiverAddress = "0x23Fc32698598980c628e8BC6a5DCCf79B2652d73";
//create private key
// const privateKey = crypto.randomBytes(32);
const privateKey = fromHexString(
  "c184baa56b137b7129ea145494f86dafb92dcce74cb0197b38ad4df33708f40a"
);

const secret = crypto.randomBytes(32);
const amount = 10000000000000000000n; // 10*1e18

// sign message
(async () => {
  let proof = {
    pi_a: [
      "19944402565619965924885130049835992382926383863012714943097873581242617689930",
      "5874940294864690483607320160721587458604385163956398607289273616890807086905",
      "1",
    ],
    pi_b: [
      [
        "17990599258408234392713867983464184649838736101399243984395797369206609355467",
        "5657784629386093876912021130969202290680971156865950602569457277645113204964",
      ],
      [
        "3580276632517902511880768369940229939310225433876581457504019383489317340708",
        "20799945598016124745205056865342943722608199573462543618878365777011519388622",
      ],
      ["1", "0"],
    ],
    pi_c: [
      "10827595452149892713613969369475863580531841899704093293456748377121204640775",
      "3876217505662790542574567016235371102671611463594210942759251210071749263939",
      "1",
    ],
    protocol: "groth16",
    curve: "bn128",
  };

  let publicSignals = [
    "687646025091532448527707505288253954804449848235",
    "12848295155899053512721118494559077189093031012992867295920360288888115610603",
    "10000000000000000000",
    "20225151404689768264933927803682948086748045870719583357136581464117538607905",
    "44368861748297803542522036335447135422439639516827856216054521997449329219618",
  ];
  // verify proof
  console.log("Verifying proof ...");
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
    console.log("Invalid proof", res);
    exit(1);
  }
  console.log("Proof verified in " + (Date.now() - time) + "ms");
  exit(0);
})();
