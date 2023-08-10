<script lang="ts">
  import svelteLogo from "./assets/svelte.svg";
  import viteLogo from "/vite.svg";
  import Counter from "./lib/Counter.svelte";

  // const snarkjs = require("snarkjs");
  import { snarkjs } from "./snark";

  const input = {
    Ax: "33606136660873349500077539335577002836555721975348679158112115848761244999188",
    Ay: "82065565619001437799466744333825021021626231209050745339092571326215212339479",
    R8x: "71672996652330624645404819707641833029399972282455933086358363568895139685385",
    R8y: "100169425877108870146342806548785434220179261377276100317075826877419973350941",
    S: "1536218713669167262430705522621550662148081230987607692036779684926340614407",
    secret:
      "24815557357349165835085152515460917254838492842630291337498966694878146771232",
    address: "205438856290388851560088700199990273911648759155",
  };
  (async () => {
    console.log("Creating proof...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      "gift.wasm",
      "gift.zkey"
    );
    console.log("Proof created!");
    console.log("proof", proof);
  })();
</script>

<main>
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a
      href="https://github.com/sveltejs/kit#readme"
      target="_blank"
      rel="noreferrer">SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
