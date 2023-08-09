#!/usr/bin/env bash

# set the target folder where the .circom files are located
target_folder="."

wasm_target_folder="../frontend/public"
vk_target_folder="../frontend/src/assets"
# sol_target_folder=""
filename="gift"

# compile the .circom file using circom
circom "$filename".circom --r1cs --wasm

# move the .wasm file to the wasm_target_folder
mv "$filename"_js/"$filename".wasm "$wasm_target_folder"

# delete "$filename"_js folder
rm -rf "$filename"_js

# generate the .zkey file using snarkjs
snarkjs groth16 setup "$filename".r1cs pot14_final.ptau "$filename".zkey

# Extracting the json verification key
snarkjs zkey export verificationkey "$filename".zkey "$filename"_vk.json

# move the .zkey file to the wasm_target_folder
mv "$filename".zkey "$wasm_target_folder"

# move the _vk.json files to the vk_target_folder
mv "$filename"_vk.json "$vk_target_folder"

# create solidity verifier
# snarkjs zkey export solidityverifier "$filename"".zkey"  "$sol_target_folder/""$filename"Verifier.sol