require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",

  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/c-vDZv0x75C6GDriVJ2HE',
      accounts: ['817432646a8b37b2c820df338595a0afbf465243c04a2ac608b001b6cd498ac5'],
    },
  }
};
