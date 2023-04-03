// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract SmartVote {
    address private CarteElectorale;
    constructor(address CarteElectoralAddress) {
        CarteElectorale = CarteElectoralAddress;
    }

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
    bool public constant debutVote = false;

    
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
        require (msg.sender == address(this), "Not owner");
        _;
    }

    //require all the parameters to not be empty
    modifier inputCandidatNotEmpty (string calldata _nom, string calldata _prenom, string calldata _partie, string calldata _programmeDescription, string calldata _uri) {
        require(bytes(_nom).length > 0 && bytes(_prenom).length > 0 && bytes(_partie).length > 0 && bytes(_programmeDescription).length > 0 && bytes(_uri).length > 0, "Un des champs est vide");
        _;
    }

    modifier electorExist {
        require(electeurs[msg.sender].noSecuSoc > 0, "Elector doesnt exist");
        _;
    }

    //return the array of candidats
    function getCandidats() public view returns (Candidat[] memory) {
        return candidats;
    }

    //we add a candidat in the candidats array
    
    /*function setCandidat(string calldata _nom, string calldata _prenom, string calldata _partie, string calldata _programmeDescription, string calldata _uri) public 
    inputCandidatNotEmpty( _nom, _prenom, _partie, _programmeDescription, _uri) 
    onlyOwner {
        candidats.push(Candidat(
            _nom, _prenom, _partie,_programmeDescription, _uri
        ));
    }*/
    function setCandidat(Candidat calldata _newCandidat) public 
    inputCandidatNotEmpty(_newCandidat.nom, _newCandidat.prenom, _newCandidat.partie, _newCandidat.programmeDescription, _newCandidat.uri)
    onlyOwner {
        candidats.push(_newCandidat);
    }


    /*function updateCandidat(uint _index, string calldata _nom, string calldata _prenom, string calldata _partie, string calldata _programmeDescription, string calldata _uri) public 
    inputCandidatNotEmpty( _nom, _prenom, _partie, _programmeDescription, _uri) 
    onlyOwner {
        candidats[_index].nom = _nom;
        candidats[_index].prenom = _prenom;
        candidats[_index].partie = _partie;
        candidats[_index].programmeDescription = _programmeDescription;
        candidats[_index].uri = _uri;
    }*/
    function updateCandidat(uint _index, Candidat calldata _candidat) public 
    inputCandidatNotEmpty(_candidat.nom, _candidat.prenom, _candidat.partie, _candidat.programmeDescription, _candidat.uri)
    onlyOwner {
        candidats[_index].nom = _candidat.nom;
        candidats[_index].prenom = _candidat.prenom;
        candidats[_index].partie = _candidat.partie;
        candidats[_index].programmeDescription = _candidat.programmeDescription;
        candidats[_index].uri = _candidat.uri;
    }

    //function deleteCandidat

    function setElecteur(uint _noSecu) public onlyOwner {
        require(!noSecuUsed[_noSecu], "Secu number already used");
        electeurs[msg.sender] = Electeur(_noSecu, false, false);
        noSecuUsed[_noSecu] = true;
    }

    function mintCarteElectorale() public view onlyOwner electorExist {
        require(!electeurs[msg.sender].mintOk, "Nft already minted");
        
        //appel au contrat CarteElectorale pour minter le nft et l'envoyer à l'élécteur
    }

    function vote(uint _idCandidat) public electorExist {
        require(electeurs[msg.sender].mintOk, "Nft needed");
        require(!electeurs[msg.sender].voteOk, "Vote already done");
        //require vote ouvert

        votes[_idCandidat] += 1;
    }

    function resultat() public view returns (uint256[] storage){
        uint256[] storage res;
        for (uint i = 0; i < candidats.length; i++) {
            res.push(votes[i]);
        }
        return res;
    }

}