const { expect } = require("chai");

describe("SmartVote Test", function () {
    let owner;

    beforeEach(async function () {
        // Retrieve the default account from ethers
        [owner] = await ethers.getSigners();

        // A helper to get the contracts instance and deploy it locally
        const CarteElectorale = await ethers.getContractFactory("CarteElectorale");
        ce = await CarteElectorale.deploy();
        
        const SmartVote = await ethers.getContractFactory("SmartVote");
        smartVote = await SmartVote.deploy(ce.address);
        

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
            
            expect(smartVote.getCandidat(6)).to.be.revertedWith("Candidat doesnt exist");
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

        it("should delete a candidat and won't get it", async () => {
            //Create a candidat
            const candidat = {
                nom: 'Jean',
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
        it("should create a new electeur and get it", async () => {
            const noSecu = 160042531111426;
            await smartVote.setElecteur(noSecu);
    
            const electeur = await smartVote.getElecteur(owner.address);
            expect(electeur).to.be.not.null;
            expect(electeur.noSecuSoc).to.equal(160042531111426)

            //if we create another electeur with this address : revert
            await expect(smartVote.setElecteur(noSecu)).to.be.reverted;
        });

        it("should delete an electeur and wont get any values", async () => {
            const noSecu = 160042531111426;

            await expect(smartVote.deleteElecteur(noSecu)).to.be.revertedWith("Secu number not used");

            await smartVote.setElecteur(noSecu);
            const electeur = await smartVote.getElecteur(owner.address);

            await smartVote.deleteElecteur(noSecu);
            
            const electeurDeleted = await smartVote.getElecteur(owner.address);
            expect (electeurDeleted.noSecuSoc).to.equal(0);
        });
    });

    describe("Fonction electorale", function () {
        it("should mint carteElectorale but only once", async () => {
            //create electeur
            const noSecu = 160042531111426;
            await smartVote.setElecteur(noSecu);

            //transfert of owner ship and mint
            await ce.transferOwnership(smartVote.address);
            await smartVote.mintCarteElectorale();
            
            await expect(smartVote.mintCarteElectorale()).to.be.revertedWith("Nft already minted");

        });
        it("should vote but only once", async () => {
            //create electeur
            const noSecu = 160042531111426;
            await smartVote.setElecteur(noSecu);
            //Create a candidat
            const candidat = {
                nom: 'Eric',
                prenom: 'Dupre',
                partie: 'Comm',
                programmeDescription: 'lorem ipsum dolor sitamet',
                uri: 'ldkjnlskfjsklfsjfs',
            }
            await smartVote.setCandidat(candidat);

            await expect(smartVote.vote(0)).to.be.revertedWith("Nft needed");

            //transfert of owner ship and mint
            await ce.transferOwnership(smartVote.address);
            await smartVote.mintCarteElectorale();

            await smartVote.startVote();

            expect(smartVote.vote(6)).to.be.revertedWith("Candidat doesnt exist");
            await smartVote.vote(0);

            const vote = await smartVote.getVote(0);
            expect (vote).to.be.equal(1);

            await expect(smartVote.vote(0)).to.be.revertedWith("Vote already done");
        });
        it("should pause & unpause mint", async () => {
            //create electeur
            const noSecu = 160042531111426;
            await smartVote.setElecteur(noSecu);

            await ce.transferOwnership(smartVote.address);

            await smartVote.startVote();

            await expect(smartVote.mintCarteElectorale()).to.be.revertedWith("Pausable: paused");

            await smartVote.unpause();

            smartVote.mintCarteElectorale();
        });
        it("should count vote blanc & votes", async () => {
            //create electeur
            const noSecu = 160042531111426;
            await smartVote.setElecteur(noSecu);
            //Create a candidat
            const candidat = {
                nom: 'Eric',
                prenom: 'Dupre',
                partie: 'Comm',
                programmeDescription: 'lorem ipsum dolor sitamet',
                uri: 'ldkjnlskfjsklfsjfs',
            }
            const candidat2 = {
                nom: 'Eric',
                prenom: 'Dupre',
                partie: 'Comm',
                programmeDescription: 'lorem ipsum dolor sitamet',
                uri: 'ldkjnlskfjsklfsjfs',
            }
            await smartVote.setCandidat(candidat);
            await smartVote.setCandidat(candidat2);

            await ce.transferOwnership(smartVote.address);
            smartVote.mintCarteElectorale()

            await smartVote.startVote();
            await smartVote.vote(1);

            const res = await smartVote.getResultats();
            expect(res[0]).to.equal(0);
            expect(res[1][1]).to.equal(1);
        });
        it("should get voteOuvert", async () => {
            const voteNotStarted = await smartVote.getVoteStarted();
            expect(voteNotStarted).to.be.false;

            await ce.transferOwnership(smartVote.address);
            await smartVote.startVote();
            
            const voteStarted = await smartVote.getVoteStarted();
            expect(voteStarted).to.be.true;
        });
        it("should start/end vote", async () => {
            const voteNotStarted = await smartVote.getVoteStarted();
            expect(voteNotStarted).to.be.false;

            await ce.transferOwnership(smartVote.address);
            await smartVote.startVote();
            
            const voteStarted = await smartVote.getVoteStarted();
            expect(voteStarted).to.be.true;

            await smartVote.voteOver();

            const voteEndend = await smartVote.getVoteStarted();
            expect(voteEndend).to.be.false;
        });
        it("should pause/unpause CE via SmartVote", async () => {
            const notPaused = await ce.paused();
            expect(notPaused).to.be.false;

            await ce.transferOwnership(smartVote.address);

            await smartVote.pause();
            const paused = await ce.paused();
            expect(paused).to.be.true;

            await smartVote.unpause();
            const unPaused = await ce.paused();
            expect(unPaused).to.be.false;
            
        })
    })
    

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