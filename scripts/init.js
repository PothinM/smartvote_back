// scripts/init.js
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




    //creating four candidats
    //Create a candidat
    const c1 = {
        nom: 'Eric',
        prenom: 'Dupre',
        partie: 'Gauche',
        programmeDescription: 
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        uri: 'ipfs://bafybeidsakn2fq6ijearehy37se4brdvogazqjllto2lnqtfa5tc7afe7u',
    }

    const c2 = {
        nom: 'Jean Paul',
        prenom: 'De lacourt',
        partie: 'Centre',
        programmeDescription: 
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        uri: 'ipfs://bafybeidsakn2fq6ijearehy37se4brdvogazqjllto2lnqtfa5tc7afe7u',
    }

    const c3 = {
        nom: 'Philippe',
        prenom: 'Dupont',
        partie: 'Droite',
        programmeDescription: 
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        uri: 'ipfs://bafybeidsakn2fq6ijearehy37se4brdvogazqjllto2lnqtfa5tc7afe7u',
    }
    const candidats = [c1,c2,c3];
    for (let index = 0; index < candidats.length; index++) {
        let txCandidat = await smartVote.setCandidat(candidats[index]);
        await txCandidat.wait(); // wait for this tx to finish to avoid nonce issues
        console.log(`Candidat ${index} created`);
    }

    /*for (let index = 1; index < 4; index++) {
        const candidat = {
            nom: 'Eric'+index,
            prenom: 'Dupre',
            partie: 'Comm',
            programmeDescription: 
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            uri: 'ipfs://bafybeidsakn2fq6ijearehy37se4brdvogazqjllto2lnqtfa5tc7afe7u',
        }

        let txCandidat = await smartVote.setCandidat(candidat);
        await txCandidat.wait(); // wait for this tx to finish to avoid nonce issues
        console.log(`Candidat ${index} created`);
    }*/

    /*
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
    */

    
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });