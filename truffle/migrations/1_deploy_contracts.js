const GiftCard = artifacts.require("GiftCard");
const USDC = artifacts.require("Test_USDC");

module.exports = async function (deployer) {
  const USDC_Addr = (await deployer.deploy(USDC)).address;
  console.log("USDC Address: ", USDC_Addr);
  const GiftCard_Addr = await deployer.deploy(GiftCard, USDC_Address);
  console.log("GiftCard Address: ", GiftCard_Addr.address);
};
