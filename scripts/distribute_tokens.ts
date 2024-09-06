import { ethers } from "hardhat";

// TODO: Check address, lock time
const clgoAddress = "0x6F7E8CE7Db573613f4422B71dA2071869A48c5De"; // mainnet
const vestAddress = "0xbb49369bAbF6634C9d522cBdCcad369b8E696486"; // mainnet
const vestingDuration = 60 * 60 * 24 * 30 * 6; // 6 months

if (vestingDuration === 0) {
  console.error("Invalid configurations");
  process.exit();
}

async function main() {
  const [admin] = await ethers.getSigners();

  const CLGO = await ethers.getContractAt("CLGO", clgoAddress, admin);
  const TokenVesting = await ethers.getContractAt("TokenVesting", vestAddress);

  // TODO: check total setting amount
  const totalAmountToDistribute = ethers.parseEther("30000");

  const balanceBefore = await CLGO.balanceOf(TokenVesting.target);

  if (balanceBefore !== 0n) {
    console.error(
      "TokenVesting 컨트랙트에 이미 자금이 있습니다. 무시하려면 이 코드를 주석처리 하세요."
    );
    return;
  }

  await CLGO.connect(admin).transfer(
    TokenVesting.target,
    totalAmountToDistribute
  );

  const beneficiaries: `0x${string}`[] = [
    "0xBE0B3d9A716de4f099025a0935438534bC030Ad8",
    // "0xce8c7825aE9E5d7A7eAc323C929086c50532eEa5",
    // "",
    // "",
    // "",
  ];

  const vestingAmounts: bigint[] = [
    ethers.parseEther("30000"),
    // ethers.parseEther("30000"),
    // ethers.parseEther("30000"),
    // ethers.parseEther("30000"),
    // ethers.parseEther("30000"),
  ];

  const sum = vestingAmounts.reduce((sum, v) => BigInt(sum) + v, 0n);

  if (sum !== totalAmountToDistribute) {
    console.log(
      `contract balance: ${totalAmountToDistribute}, amount to be set: ${sum}`
    );
    console.error(
      "The contract balance and the amount to be set are different. To ignore, comment out this code."
    );
    return;
  }

  const latestBlock = await ethers.provider.getBlock("latest");
  const _releaseTimes = latestBlock!.timestamp + vestingDuration;
  const releaseTimes = [
    _releaseTimes,
    // _releaseTimes,
    // _releaseTimes,
    // _releaseTimes,
    // _releaseTimes,
  ];

  const tx = await TokenVesting.connect(admin).distributeTokens(
    beneficiaries,
    vestingAmounts,
    releaseTimes
  );

  console.log({ tx });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
