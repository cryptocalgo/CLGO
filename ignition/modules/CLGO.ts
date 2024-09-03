import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CLGOModule = buildModule("CLGOModule", (m) => {
  // CLGO deploy
  const clgoToken = m.contract("CLGO");

  // TokenVesting delpoy, CLGO token address argument
  const vestingContract = m.contract("TokenVesting", [clgoToken]);

  return { clgoToken, vestingContract };
});

export default CLGOModule;
