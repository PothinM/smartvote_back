// scripts/startStopVote.js
const { ethers } = require("hardhat");

async function main() {
    const signers = await ethers.getSigners();
    const contractOwner = signers[0].address;

    console.log('Getting the Electoral card contract ...\n');
    const carteElectoraleAddress = '0xf857A2d93dEc386687cFa58E48acFbd66d402650...';
    console.log(`At ${carteElectoraleAddress}...\n`);
    const carteElectoraleNFT =await ethers.getContractAt('CarteElectorale', carteElectoraleAddress);
    
    console.log('Getting the Smart Vote contract ...\n');
    const smartVoteAddress = '0x20ef9C0DCc7E63ecaB49E53004Bb8d7721f6D37E...';
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