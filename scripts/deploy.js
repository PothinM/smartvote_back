// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // Get the contract owner
  const contractOwner = await ethers.getSigners();
  console.log(`Deploying contract from: ${contractOwner[0].address}`);

  // Hardhat helper to get the ethers contractFactory object
  const CarteElectoraleNft = await ethers.getContractFactory('CarteElectorale');
  // Deploy the NFT contract
  console.log('Deploying CarteElectorale...');
  const carteElectoraleNft = await CarteElectoraleNft.deploy();
  await carteElectoraleNft.deployed();
  console.log(`CarteElectorale deployed to: ${carteElectoraleNft.address}`);


  // Hardhat helper to get the ethers contractFactory object
  const SmartVote = await ethers.getContractFactory('SmartVote');
  // Deploy the NFT contract
  console.log('Deploying CarteElectorale...');
  const smartVote = await SmartVote.deploy(carteElectoraleNft.address);
  await smartVote.deployed();
  console.log(`SmartVote deployed to: ${smartVote.address}`);

  //transfering ownership from contract owner to smartVote
  await carteElectoraleNft.transferOwnership(smartVote.address);
  console.log("Transfered ownership from contract owner to smartVote address");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });