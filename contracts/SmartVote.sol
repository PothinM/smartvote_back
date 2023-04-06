// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "./CarteElectorale.sol";

contract SmartVote {
    address private CarteElectoraleAddress;
    address public owner;
    CarteElectorale ce;

    constructor(address _CarteElectoralTokenAddress) {
        ce = CarteElectorale(_CarteElectoralTokenAddress);
        owner = msg.sender;
    }

    //to check if empty field
    bytes32 constant NULL = "";

    struct Electeur {
        uint noSecuSoc;
        bool voteOk;
        bool mintOk;
    }

    struct Candidat {
        string nom;
        string prenom;
        string partie;
        string programmeDescription;
        string uri;
    }

    //vote commencé 
    bool public voteOuvert = true;//changer à false
    bool public paused = false;

    //nb de vote
    uint public countVote = 0;

    
    //@a struct Electeur is pointing to an address to keep track of an elector
    mapping (address => Electeur) electeurs;
    //mapping noSecuSoc => bool (to keep track of an inscription with a secu number)
    mapping (uint => bool) noSecuUsed;
    //@a struct Candidat is pointing to an uint to give an id to a candidat
    //mapping (uint => Candidat) Candidats;
    Candidat[] public candidats;

    //mapping idCandidat => voix
    mapping (uint => uint) votes;

    //nbVotes (soustrait avec le nb de nft minté pour calculer taux d'abstention)

    //modifier need to be owner of the contract
    modifier onlyOwner() {
        require (msg.sender == owner, "Not owner");
        _;
    }

    //require all the parameters to not be empty
    modifier inputCandidatNotEmpty (string calldata _nom, string calldata _prenom, string calldata _partie, string calldata _programmeDescription, string calldata _uri) {
        require(bytes(_nom).length > 0 && bytes(_prenom).length > 0 && bytes(_partie).length > 0 && bytes(_programmeDescription).length > 0 && bytes(_uri).length > 0, "One of the fields is empty");
        _;
    }

    modifier electorExist {
        require(electeurs[msg.sender].noSecuSoc > 0, "Elector doesnt exist");
        _;
    }

    modifier candidatExist (uint _index) {
        require(_index <= candidats.length,"Candidat doesnt exist");
        _;
    }

    //return the array of candidats
    function getCandidats() public view returns (Candidat[] memory) {
        return candidats;
    }

    //return the candidat at index
    function getCandidat(uint _index) public view candidatExist (_index) 
    returns (Candidat memory) {
        return candidats[_index];
    }

    //we add a candidat in the candidats array
    function setCandidat(Candidat calldata _newCandidat) public 
    inputCandidatNotEmpty(_newCandidat.nom, _newCandidat.prenom, _newCandidat.partie, _newCandidat.programmeDescription, _newCandidat.uri)
    onlyOwner {
        candidats.push(_newCandidat);
    }


    function updateCandidat(uint _index, Candidat calldata _candidat) public 
    inputCandidatNotEmpty(_candidat.nom, _candidat.prenom, _candidat.partie, _candidat.programmeDescription, _candidat.uri)
    onlyOwner {
        require(_index < candidats.length, "index out of bound");
        candidats[_index].nom = _candidat.nom;
        candidats[_index].prenom = _candidat.prenom;
        candidats[_index].partie = _candidat.partie;
        candidats[_index].programmeDescription = _candidat.programmeDescription;
        candidats[_index].uri = _candidat.uri;
    }

    function deleteCandidat(uint _index) public 
    onlyOwner {
        require(_index < candidats.length, "index out of bound");

        for (uint i = _index; i < candidats.length - 1; i++) {
            candidats[i] = candidats[i +1];
        }
        candidats.pop();
    }

    function getElecteur(address _address) public view returns (Electeur memory) {
        return electeurs[_address];
    }

    function setElecteur(uint _noSecu) public onlyOwner {
        require(!noSecuUsed[_noSecu], "Secu number already used");
        require(!(electeurs[msg.sender].noSecuSoc > 0), "Address already used");
        electeurs[msg.sender] = Electeur(_noSecu, false, false);
        noSecuUsed[_noSecu] = true;
    }

    function deleteElecteur(uint _noSecu) public onlyOwner {
        require(noSecuUsed[_noSecu], "Secu number not used");
        require(electeurs[msg.sender].noSecuSoc == _noSecu, "Address isnt the address of this secu number");
        noSecuUsed[_noSecu] = false;
        delete electeurs[msg.sender];
    }

    function mintCarteElectorale() public electorExist {
        require(!electeurs[msg.sender].mintOk, "Nft already minted");
        require(!paused,"Mint paused");
        
        //changement du state pour l'electeur
        electeurs[msg.sender].mintOk = true;
        //appel au contrat CarteElectorale pour minter le nft et l'envoyer à l'élécteur
        ce.safeMint(msg.sender);

    }

    function vote(uint _idCandidat) public electorExist candidatExist (_idCandidat) {
        require(electeurs[msg.sender].mintOk, "Nft needed");
        require(!electeurs[msg.sender].voteOk, "Vote already done");
        require(voteOuvert,"Vote not started");

        electeurs[msg.sender].voteOk = true;
        countVote += 1;
        votes[_idCandidat] += 1;
    }

    function getVote(uint _idCandidat) public view returns (uint) {
        return votes[_idCandidat];
    }

    function getResultats() public view returns(uint, uint256[] memory) {
        
        //vote blanc = nombre de CE minté - nombre de vote
        uint256 voteBlanc = ce.getCarteElectoraleCounter() - countVote;
        
        //on crée un tableau de resultats de la taille du nombre de candidats
        uint256[] memory resultats = new uint256[](candidats.length);
        for (uint i = 0; i < candidats.length; i++) { 
            resultats[i] = votes[i]; //on assigne le nombre de vote pour chaque candidat
        }

        return (voteBlanc, resultats);
    }

    function startVote() public onlyOwner {
        //ouvre les votes
        voteOuvert = true;
        //pause mint
        ce.pause();
    }

    function unpause() public onlyOwner {
        ce.unpause();
    }

    function voteOver() public onlyOwner {
        voteOuvert = false;
        
    }

    /*function resultat() public view returns (uint256[] memory){
        uint256[] storage res;
        for (uint i = 0; i < candidats.length; i++) {
            res.push(votes[i]);
        }
        return res;
    }*/

}