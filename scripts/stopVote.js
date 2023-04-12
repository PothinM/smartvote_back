// scripts/startStopVote.js
const { ethers } = require("hardhat");

async function main() {
    const signers = await ethers.getSigners();
    const contractOwner = signers[0].address;

    console.log('Getting the Electoral card contract ...\n');
    const carteElectoraleAddress = '0xe28E8F56dBfbbdC46ef7aDBa81107921e631418e';
    console.log(`At ${carteElectoraleAddress}...\n`);
    const carteElectoraleNFT =await ethers.getContractAt('CarteElectorale', carteElectoraleAddress);
    
    console.log('Getting the Smart Vote contract ...\n');
    const smartVoteAddress = '0x7eD9480879Fc003469E68c43CbCBfdB262Db12a6';
    console.log(`At ${smartVoteAddress}...\n`);
    const smartVote =await ethers.getContractAt('SmartVote', smartVoteAddress);

    // let txSwitchVote = await smartVote.getVoteStarted();

    let txVoteOver = await smartVote.voteOver();
    await txVoteOver.wait();
    console.log("Vote Stopped");
    
    /*if (txSwitchVote){
        console.log("Vote ouvert");
    }
    else{
        console.log("Vote fermé");
    }*/


}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });