<script>
  import { onMount } from "svelte";
  import { buildPoseidon, buildEddsa } from "circomlibjs";
  import * as ffj from "ffjavascript";
  import { snarkjs } from "../snark";

  let giftCode = undefined;
  let verified = false;
  let valid = undefined;
  let claimed = undefined;
  let beneficiary = undefined;

  // TODO: get from contract
  const A = [
    fromHexString(
      "f46946e29b52097a8121576926f1b9c73289b187f793ebca2bfdcaba298d9726"
    ),
    fromHexString(
      "c48392ff5b1b5320214e681fec4cc5398a36b0d975c3842dd06475b316c7900b"
    ),
  ];

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    giftCode = urlParams.get("code") || undefined;
    if (giftCode === undefined) {
      valid = false;
      verified = true;
      return;
    }
    // decode Base64 encoded gift code and create json
    try {
      giftCode = JSON.parse(atob(giftCode));
    } catch (e) {
      valid = false;
      verified = true;
      return;
    }
    console.log("giftCode", giftCode);
    // calculate hash
    const poseidon = await buildPoseidon();
    const hash = poseidon.F.toString(
      poseidon([
        toDecimalString(fromHexString(giftCode.sec)),
        BigInt(giftCode.a),
      ])
    );
    console.log("hash", hash);
    const hashBuf = fromHexString(BigInt(hash).toString(16)).slice(0, 12);
    console.log("hashBuf", hashBuf.toString());
    // Verify signature of hash
    const eddsa = await buildEddsa();
    console.log("rs:", {
      R8: [fromHexString(giftCode.R8x), fromHexString(giftCode.R8y)],
      S: giftCode.S,
    });
    const res = eddsa.verifyMiMCSponge(
      eddsa.babyJub.F.e(ffj.Scalar.fromRprLE(hashBuf, 0)),
      {
        R8: [fromHexString(giftCode.R8x), fromHexString(giftCode.R8y)],
        S: giftCode.S,
      },
      A
    );
    if (!res) {
      valid = false;
      verified = true;
      console.log("%cInvalid signature", "color: red ; font-size: 1rem");
      return;
    }
    // TODO check if A is same in contract
    // TODO check if gift card has been claimed

    valid = true;
    verified = true;
    console.log("verified", verified);
  });

  async function redeem() {
    if (!valid) return;
    //generate proof
    const input = {
      secret: toDecimalString(fromHexString(giftCode.sec)),
      amount: BigInt(giftCode.a).toString(),
      Ax: toDecimalString(A[0]),
      Ay: toDecimalString(A[1]),
      R8x: toDecimalString(fromHexString(giftCode.R8x)),
      R8y: toDecimalString(fromHexString(giftCode.R8y)),
      S: giftCode.S,
      address: BigInt(beneficiary).toString(),
    };
    console.log("input", input);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      "gift.wasm",
      "gift.zkey"
    );
    console.log("proof", proof);
    console.log("publicSignals", publicSignals);
    //convert proof to solidity inputs
    console.log("ABC", getABCFrom(proof));
    console.log(
      "inputs",
      publicSignals.map((x) => x.toString())
    );
  }

  function toHexString(bytes) {
    return bytes.reduce(
      (str, byte) => str + byte.toString(16).padStart(2, "0"),
      ""
    );
  }
  function toDecimalString(bytes) {
    return BigInt("0x" + toHexString(bytes)).toString();
  }

  function fromHexString(hexString) {
    return new Uint8Array(
      hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
  }
  function getABCFrom(proof) {
    return {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ],
      c: [proof.pi_c[0], proof.pi_c[1]],
    };
  }
</script>

<main>
  {#if verified}
    {#if valid}
      <h1>Gift Card</h1>
      <div style="display: flex">
        <input
          type="text"
          placeholder="receiver address"
          bind:value={beneficiary}
        />
        <button on:click={redeem}>Redeem</button>
      </div>
    {:else}
      <p>Invalid gift card code.</p>
    {/if}
  {:else}
    <!-- TODO: show loader -->
    <p>Loading</p>
  {/if}
</main>

<style>
  main {
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 2rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
