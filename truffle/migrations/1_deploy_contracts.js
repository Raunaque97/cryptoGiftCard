const GiftCard = artifacts.require("GiftCard");
const USDC = artifacts.require("Test_USDC");

// TODO: remove hardcoded pub key
const Ax =
  "5365062212601730596199768969558841529585207922760252174628177135210107775428";
const Ay =
  "15435602676538782803101123486227542523709602869628452628562469877622660614616";

module.exports = async function (deployer) {
  await deployer.deploy(USDC);
  console.log("USDC Address: ", USDC.address);
  await deployer.deploy(GiftCard, USDC.address, Ax, Ay);
  console.log("GiftCard Address: ", GiftCard.address);
};
