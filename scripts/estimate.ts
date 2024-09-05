import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory("CLGO");
  const deployTransaction = await contract.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas(deployTransaction);

  console.log("Estimated Gas(CLGO):", estimatedGas.toString());

  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  if (!gasPrice) {
    console.error("gasPrice is null");
  } else {
    console.log("Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "Gwei");

    const totalGasCost = estimatedGas * gasPrice;
    console.log("Total Gas Cost in wei:", totalGasCost.toString());

    const totalGasCostInEth = ethers.formatEther(totalGasCost);
    console.log("Total Gas Cost in ETH:", totalGasCostInEth);
  }

  const contract2 = await ethers.getContractFactory("TokenVesting");
  const deployTransaction2 = await contract2.getDeployTransaction(
    "0xce8c7825aE9E5d7A7eAc323C929086c50532eEa5",
    "0xce8c7825aE9E5d7A7eAc323C929086c50532eEa5"
  );
  const estimatedGas2 = await ethers.provider.estimateGas(deployTransaction2);

  console.log("Estimated Gas(TokenVesting):", estimatedGas2.toString());

  if (!gasPrice) {
    console.error("gasPrice is null");
  } else {
    console.log("Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "Gwei");

    const totalGasCost = estimatedGas2 * gasPrice;
    console.log("Total Gas Cost in wei:", totalGasCost.toString());

    const totalGasCostInEth = ethers.formatEther(totalGasCost);
    console.log("Total Gas Cost in ETH:", totalGasCostInEth);
  }
}

main();
