const TokenSwap = artifacts.require("TokenSwap");
const ERC20TK1 = artifacts.require("ERC20TK1");
const ERC20TK2 = artifacts.require("ERC20TK2");

module.exports = async function (deployer) {
  await deployer.deploy(ERC20TK1);
  await deployer.deploy(ERC20TK2);
  await deployer.deploy(TokenSwap, ERC20TK1.address, ERC20TK1.address, 10^18);
};
