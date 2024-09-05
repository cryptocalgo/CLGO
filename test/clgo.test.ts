import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("CLGO and TokenVesting with distributeTokens", function () {
  const initialSupply = ethers.parseEther("1000000000"); // 10억 CLGO tokens

  async function deployClgo() {
    // Get signers
    const accounts = await ethers.getSigners();
    const owner = accounts[0];
    const operator = accounts[1];

    // Deploy CLGO token
    const CLGOFactory = await ethers.getContractFactory("CLGO");
    const CLGO = await CLGOFactory.deploy();
    await CLGO.waitForDeployment();

    // Deploy TokenVesting contract
    const TokenVestingFactory = await ethers.getContractFactory("TokenVesting");
    const TokenVesting = await TokenVestingFactory.deploy(
      CLGO.target,
      operator
    );
    await TokenVesting.waitForDeployment();

    // Mint tokens to the owner (accounts[0])
    await CLGO.mint(accounts[0].address, initialSupply);

    return {
      CLGO,
      TokenVesting,
      accounts,
      owner,
      operator,
    };
  }

  it("should not allow claiming tokens twice using distributeTokens", async function () {
    const { accounts, TokenVesting, CLGO } = await loadFixture(deployClgo);
    const vestingAmount = ethers.parseEther("1000"); // Each account gets 1000 tokens
    const vestingDuration = 60 * 60 * 24 * 30; // 30 days
    const releaseTime = (await time.latest()) + vestingDuration;

    // Distribute tokens to a single beneficiary
    await TokenVesting.distributeTokens(
      accounts.slice(1, 5).map((a) => a.address),
      [vestingAmount, vestingAmount, vestingAmount, vestingAmount],
      [releaseTime, releaseTime, releaseTime, releaseTime]
    );

    console.log({
      acnts: accounts.slice(1, 5).map((a) => a.address),
    });

    // Transfer tokens to the vesting contract
    await CLGO.transfer(TokenVesting.target, vestingAmount * BigInt(4));

    await expect(
      TokenVesting.connect(accounts[1]).claim(accounts[1])
    ).to.be.revertedWith("Tokens are not yet releasable");

    // Move time forward by 30 days
    await time.increase(vestingDuration);

    for (var i = 1; i < 5; i++) {
      // First claim (should succeed)
      await TokenVesting.connect(accounts[i]).claim(accounts[i]);
      const balance = await CLGO.balanceOf(accounts[i].address);
      expect(balance).to.equal(vestingAmount);
    }

    expect(await CLGO.balanceOf(TokenVesting.target)).to.be.equal(BigInt(0));

    // Second claim (should fail)
    await expect(
      TokenVesting.connect(accounts[1]).claim(accounts[1])
    ).to.be.revertedWith("Tokens already claimed");
  });

  it.only("operator role", async () => {
    const { accounts, owner, operator, TokenVesting, CLGO } = await loadFixture(
      deployClgo
    );
    const vestingAmount = ethers.parseEther("1000"); // Each account gets 1000 tokens
    const vestingDuration = 60 * 60 * 24 * 30; // 30 days
    const releaseTime = (await time.latest()) + vestingDuration;

    // Distribute tokens to a single beneficiary
    await TokenVesting.distributeTokens(
      accounts.slice(1, 5).map((a) => a.address),
      [vestingAmount, vestingAmount, vestingAmount, vestingAmount],
      [releaseTime, releaseTime, releaseTime, releaseTime]
    );

    console.log({
      acnts: accounts.slice(1, 5).map((a) => a.address),
    });

    await CLGO.transfer(TokenVesting.target, vestingAmount * BigInt(4));

    // Operator도 시간 전엔 출금처리 불가
    await expect(
      TokenVesting.connect(operator).claim(accounts[1])
    ).to.be.revertedWith("Tokens are not yet releasable");

    await time.increase(vestingDuration);

    for (var i = 1; i < 5; i++) {
      const balanceBefore = await CLGO.balanceOf(accounts[i].address);
      // Operator로 claim 실행
      await TokenVesting.connect(operator).claim(accounts[i]);
      // 수혜자에게 토큰 전송됨 확인
      const balanceAfter = await CLGO.balanceOf(accounts[i].address);
      expect(balanceAfter).to.equal(vestingAmount);

      console.log(
        `${accounts[0].address}, ${balanceBefore} -> ${balanceAfter}`
      );
    }

    expect(await CLGO.balanceOf(TokenVesting.target)).to.be.equal(BigInt(0));

    // Second claim (should fail)
    await expect(
      TokenVesting.connect(operator).claim(accounts[1])
    ).to.be.revertedWith("Tokens already claimed");
  });
});
