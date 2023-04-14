// scripts/startStopVote.js
const { ethers } = require("hardhat");

async function main() {
    const signers = await ethers.getSigners();
    const contractOwner = signers[0].address;

    console.log('Getting the Electoral card contract ...\n');
    const carteElectoraleAddress = '0x48fB6e3C8E72fA12A396f9bfFDFc30e5F89B5868';
    console.log(`At ${carteElectoraleAddress}...\n`);
    const carteElectoraleNFT =await ethers.getContractAt('CarteElectorale', carteElectoraleAddress);
    
    console.log('Getting the Smart Vote contract ...\n');
    const smartVoteAddress = '0x260DFA59aC98531C9Acf1447af63E9827d12aD01';
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