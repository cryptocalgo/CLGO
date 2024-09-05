import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // console.log("Deploying contracts with the account:", deployer.address);
  // const balance = await ethers.provider.getBalance(deployer.address);
  // console.log("Account balance:", balance.toString());

  // const CLGO = await ethers.getContractFactory("CLGO");
  // const clgo = await CLGO.deploy();

  // await clgo.waitForDeployment();

  // console.log("CLGO Token deployed to:", clgo.target);

  // const initialSupply = ethers.parseEther("1000000000"); // 10억 CLGO tokens
  // await clgo.connect(deployer).mint(deployer.address, initialSupply);

  // const clgoAddr = clgo.target;
  // const operator = "0x0C88e8581Ff5E27699CDBca88ead2a08cfD13Ed5"; // 대리인 주소 설정
  // const clgoAddr = "0x6F7E8CE7Db573613f4422B71dA2071869A48c5De";

  // const TokenVesting = await ethers.getContractFactory("TokenVesting");
  // const tokenVesting = await TokenVesting.deploy(clgoAddr, operator);

  // await tokenVesting.waitForDeployment();

  // console.log("TokenVesting Contract deployed to:", tokenVesting.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
