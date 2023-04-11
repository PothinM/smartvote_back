// scripts/init.js
const { ethers } = require("hardhat");

async function main() {
    const signers = await ethers.getSigners();
    const contractOwner = signers[0].address;

    console.log('Getting the Electoral card contract ...\n');
    const carteElectoraleAddress = '0xf857A2d93dEc386687cFa58E48acFbd66d402650';
    console.log(`At ${carteElectoraleAddress}...\n`);
    const carteElectoraleNFT =await ethers.getContractAt('CarteElectorale', carteElectoraleAddress);
    
    console.log('Getting the Smart Vote contract ...\n');
    const smartVoteAddress = '0x20ef9C0DCc7E63ecaB49E53004Bb8d7721f6D37E';
    console.log(`At ${smartVoteAddress}...\n`);
    const smartVote =await ethers.getContractAt('SmartVote', smartVoteAddress);




    //creating four candidats
    //Create a candidat
    for (let index = 1; index < 4; index++) {
        const candidat = {
            nom: 'Eric'+index,
            prenom: 'Dupre',
            partie: 'Comm',
            programmeDescription: 'lorem ipsum dolor sitamet',
            uri: 'ldkjnlskfjsklfsjfs',
        }

        let txCandidat = await smartVote.setCandidat(candidat);
        await txCandidat.wait(); // wait for this tx to finish to avoid nonce issues
        console.log(`Candidat ${index} created`);
    }

    //creating an electeur
    const noSecu = 160042531111426;
    let txElecteur = await smartVote.setElecteur(noSecu);
    await txElecteur.wait();
    console.log("Electeur created");

    //minting a carte electorale for an electeur
    let txMint = await smartVote.mintCarteElectorale();
    await txMint.wait();
    console.log(`Minted carte electorale to ${contractOwner}`);

    //vote
    let txStartVote = await smartVote.startVote();
    await txStartVote.wait();
    let txVote = await smartVote.vote(1);
    await txVote.wait();
    console.log('Voted');

    //get resultats
    let txResultats = await smartVote.getResultats();
    console.log("resultats : "+ txResultats);
    

    
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });