const { expect } = require("chai");

describe("SmartVote Test", function () {
    let owner;

    beforeEach(async function () {
        // Retrieve the default account from ethers
        [owner] = await ethers.getSigners();

        // A helper to get the contracts instance and deploy it locally
        const SmartVote = await ethers.getContractFactory("SmartVote");
        smartVote = await SmartVote.deploy('0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5');

    });

    describe("Candidat CRUD", function () {
        it("should revert to set a candidat when empty fields", async () => {
            //Create a candidat
            const candidat = {
                nom: '',
                prenom: 'Luc',
                partie: 'Comm',
                programmeDescription: 'lorem ipsum dolor sitamet',
                uri: 'dslflkdsfjlsdfkj',
            }
            await expect(smartVote.setCandidat(candidat)).to.be.revertedWith("One of the fields is empty");
        });

        it("should set a candidat and get it", async () => {
            //Create a candidat
            const candidat = {
                nom: 'Eric',
                prenom: 'Dupre',
                partie: 'Comm',
                programmeDescription: 'lorem ipsum dolor sitamet',
                uri: 'ldkjnlskfjsklfsjfs',
            }
            await smartVote.setCandidat(candidat);
    
            const candidats = await smartVote.getCandidats();
            expect(candidats).to.be.not.null;
            expect(candidats[0].nom).to.equal('Eric');
            
            const value = await smartVote.getCandidat(0);
            expect(value).to.be.not.null;
            expect(value.nom).to.equal('Eric');
            // expect(value).to.equal('Jean');
        });

        it("should update a candidat and get it", async () => {
            //Create a candidat
            const candidat = {
                nom: 'Eric',
                prenom: 'Luc',
                partie: 'Comm',
                programmeDescription: 'lorem ipsum dolor sitamet',
                uri: 'ldkjnlskfjsklfsjfs',
            }
            await smartVote.setCandidat(candidat);
    
            const updatedCandidat = {
                nom: 'Michel',
                prenom: 'Luc',
                partie: 'Comm',
                programmeDescription: 'lorem ipsum dolor sitamet',
                uri: 'ldkjnlskfjsklfsjfs',
            }
            await smartVote.updateCandidat(0, updatedCandidat);

            const candidats = await smartVote.getCandidats();
            expect(candidats).to.be.not.null;
            expect(candidats[0].nom).to.equal('Michel');
            
            const value = await smartVote.getCandidat(0);
            expect(value).to.be.not.null;
            expect(value.nom).to.equal('Michel');
        });

        //delete
        it("should delete a candidat and won't get it", async () => {
            //Create a candidat
            const candidat = {
                nom: 'un',
                prenom: 'Luc',
                partie: 'Comm',
                programmeDescription: 'lorem ipsum dolor sitamet',
                uri: 'ldkjnlskfjsklfsjfs',
            }
            await smartVote.setCandidat(candidat);
            await smartVote.setCandidat(candidat);
            await smartVote.setCandidat(candidat);

            const candidats = await smartVote.getCandidats();
            expect(candidats.length).to.equal(3);

            await smartVote.deleteCandidat(1);
            
            const candidatsAfterDelete = await smartVote.getCandidats();
            expect(candidatsAfterDelete.length).to.equal(2);

            //if we select an index to delete out of bound 
            await expect(smartVote.deleteCandidat(6)).to.be.reverted;

        });
    });

    describe("Electeur CRUD", function () {
        it("should create a new electeur", async () => {
            const noSecu = 160042531111426;
            await smartVote.setElecteur(noSecu);
    
            const electeur = await smartVote.getElecteur(owner.address);
            expect(electeur).to.be.not.null;
            expect(electeur.noSecuSoc).to.equal(160042531111426)

            //if we create another electeur with this address : revert
            await expect(smartVote.setElecteur(noSecu)).to.be.reverted;
        });
    });

    

    // it("should revert when trying to transfer via safeTransferFrom", async () => {
    //     //Mint token ID 0 to owner address
    //     await smartVote.safeMint(owner.address);
        
    //     await expect(smartVote['safeTransferFrom(address,address,uint256)'](
    //         owner.address,
    //         "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
    //         0 // token id
    //     )).to.be.reverted;
    // });

    // it("should revert when trying to transfer via transferFrom", async () => {
    //     //Mint token ID 0 to owner address
    //     await smartVote.safeMint(owner.address);

    //     await expect(smartVote['transferFrom(address,address,uint256)'](
    //         owner.address,
    //         "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
    //         0 // token id
    //     )).to.be.reverted;
    // });
});