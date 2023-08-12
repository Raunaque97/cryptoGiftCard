<script>
  import { onMount } from "svelte";
  import { buildPoseidon, buildEddsa } from "circomlibjs";
  import * as ffj from "ffjavascript";

  let giftCode = undefined;
  let verified = false;
  let valid = undefined;
  let claimed = undefined;
  const A = [
    fromHexString(
      "2cb707afe37b0be069e024a7fa858453df693829220dd90eacf5f3b9e0c65321"
    ),
    fromHexString(
      "6217e2c4f5365bc10a419b9826dd5d5d75354a85f49e6a7d0572eba613059822"
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

  function redeem() {
    // Add redeem logic here
    alert("Gift card redeemed successfully!");
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
</script>

<main>
  {#if verified}
    {#if valid}
      <h1>Gift Card</h1>
      <button on:click={redeem}>Redeem</button>
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
