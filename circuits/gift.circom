pragma circom 2.1.2;

include "./node_modules/circomlib/circuits/poseidon.circom";
include "./tree.circom";

/**

*/ 
template Gift(nLevels) {
    signal input secret;
    signal input treePathIndices[nLevels];
    signal input treeSiblings[nLevels];
    signal input address;

    signal output root;
    signal output leaf; // hash(secret)
    signal output beneficiary; // address of the beneficiary

    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== secret;

    component inclusionProof = MerkleTreeInclusionProof(nLevels);
    inclusionProof.leaf <== poseidon.out;

    for (var i = 0; i < nLevels; i++) {
        inclusionProof.siblings[i] <== treeSiblings[i];
        inclusionProof.pathIndices[i] <== treePathIndices[i];
    }

    root <== inclusionProof.root;
    leaf <== poseidon.out;
    beneficiary <== address;
}

component main {public [address]} = Gift(20);