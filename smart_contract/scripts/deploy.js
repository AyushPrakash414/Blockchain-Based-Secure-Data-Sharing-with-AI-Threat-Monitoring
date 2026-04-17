const hre = require("hardhat");

async function main() {
  const Upload = await hre.ethers.deployContract("Upload");

  await Upload.waitForDeployment();

  console.log("Upload deployed to:", Upload.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});