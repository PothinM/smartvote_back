// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "./CarteElectorale.sol";

/// @title SmartVote managing contract
/// @author POTHIN Mathieu
/// @notice This contract is for Smart vote managing 
/// @dev All function calls are currently tested
/// @custom:experimental This is an experimental contract.
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
    bool public voteOuvert = false;

    //nb de vote
    uint public countVote = 0;

    
    //@a struct Electeur is pointing to an address to keep track of an elector
    mapping (address => Electeur) electeurs;
    //mapping noSecuSoc => bool (to keep track of an inscription with a secu number)
    mapping (uint => bool) noSecuUsed;
    //array of candidat 
    Candidat[] public candidats;

    //mapping idCandidat => voix
    mapping (uint => uint) votes;


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

    //checking the elector with this address has a noSecuSoc (exist) in the mapping electeurs
    modifier electorExist {
        require(electeurs[msg.sender].noSecuSoc > 0, "Elector doesnt exist");
        _;
    }

    /*TODO: add the function elector not deleted, to make sure anyone cant 
        mint nft and then delete an elector and recreate it and get another nft
    */
    /*modifier electorNotDeleted {
        require(!electeurs[msg.sender].deleted, "Elector deleted");
        _;
    }*/

    //checking the candidat at the _index in the array exist
    modifier candidatExist (uint _index) {
        require(_index <= candidats.length,"Candidat doesnt exist");
        _;
    }
    
    /// @notice Get a candidate
    /// @dev 
    /// @return Array of Struct Candidat
    function getCandidats() public view returns (Candidat[] memory) {
        return candidats;
    }

    /// @notice Return the Candidat at the index specified in the Candidats array
    /// @dev make sure the Candidat exist to get it
    /// @param _index the index of the candidat you wanna get
    /// @return Struct Candidat
    function getCandidat(uint _index) public view candidatExist (_index) 
    returns (Candidat memory) {
        return candidats[_index];
    }

    /// @notice Set a Candidat in the Candidats array
    /// @dev make sure the candidat has no empty fields
    /// @param _newCandidat the candidat we want to Set
    function setCandidat(Candidat calldata _newCandidat) public 
    inputCandidatNotEmpty(_newCandidat.nom, _newCandidat.prenom, _newCandidat.partie, _newCandidat.programmeDescription, _newCandidat.uri)
    onlyOwner {
        candidats.push(_newCandidat);
    }


    /// @notice Upgrade a Candidat in the Candidats array
    /// @dev make sur the fields arent empty, only only owner can update a Candidat, 
    /// @dev require a Candidat exist at this index
    /// @param _index index of the Candidat you wanna update
    /// @param _candidat struct Candidat you wanna upgrade
    function updateCandidat(uint _index, Candidat calldata _candidat) public onlyOwner
    inputCandidatNotEmpty(_candidat.nom, _candidat.prenom, _candidat.partie, _candidat.programmeDescription, _candidat.uri)
    onlyOwner {
        require(_index < candidats.length, "index out of bound");
        candidats[_index].nom = _candidat.nom;
        candidats[_index].prenom = _candidat.prenom;
        candidats[_index].partie = _candidat.partie;
        candidats[_index].programmeDescription = _candidat.programmeDescription;
        candidats[_index].uri = _candidat.uri;
    }

    /// @notice Delete a Candidat in the Candidats array
    /// @dev only Owner can use this function, require a Candidat exist at this index
    /// @dev put the Candidat at the end of the array and then pop it
    /// @param _index index of the Candidat you want to delete
    function deleteCandidat(uint _index) public onlyOwner
    onlyOwner {
        require(_index < candidats.length, "index out of bound");

        for (uint i = _index; i < candidats.length - 1; i++) {
            candidats[i] = candidats[i +1];
        }
        candidats.pop();
    }

    /// @notice Get an Electeur at the specified address in the mapping Electeurs
    /// @param _address address of the Electeur you want to get
    function getElecteur(address _address) public view returns (Electeur memory) {
        return electeurs[_address];
    }

    /// @notice Set an Electeur
    /// @dev the function allow only when nosecu isnt already used and address isnt used too
    /// @param _noSecu the no secu social of the Electeur we want to set (inscrire)
    function setElecteur(uint _noSecu) public {
        require(!noSecuUsed[_noSecu], "Secu number already used");
        require(!(electeurs[msg.sender].noSecuSoc > 0), "Address already used");
        electeurs[msg.sender] = Electeur(_noSecu, false, false);
        noSecuUsed[_noSecu] = true;
    }

    /// @notice Delete an Electeur
    /// @dev only owner can delete an Electeur
    /// @param _noSecu the noSecuSocial number of the electeur we want to delete
    function deleteElecteur(uint _noSecu) public onlyOwner {
        require(noSecuUsed[_noSecu], "Secu number not used");
        require(electeurs[msg.sender].noSecuSoc == _noSecu, "Address isnt the address of this secu number");
        noSecuUsed[_noSecu] = false;
        delete electeurs[msg.sender];
    }

    /// @notice Call the carteElectorale Contract to (mint) send a Carte Electorale to the msg.sender
    /// @dev call on this function can only be when msg.sender hasnt already minted his nft
    /// @dev And when the CarteElectorale isnt paused
    /// @dev and when this contract have the ownership of the nft contract
    function mintCarteElectorale() public electorExist {
        require(!electeurs[msg.sender].mintOk, "Nft already minted");
        
        //changement du state pour l'electeur
        electeurs[msg.sender].mintOk = true;
        //appel au contrat CarteElectorale pour minter le nft et l'envoyer à l'élécteur
        ce.safeMint(msg.sender);

    }

    /// @notice Vote for a candidat, increment the vote counter for this Candidat, and set voteOk to this electeur
    /// @dev call on this function can be done only when Elector & Candidat exist 
    /// @dev require Electeur to have minted his nft, hasnt voted yet and the vote to be open
    /// @param _idCandidat id of the candidat we want to vote
    function vote(uint _idCandidat) public electorExist candidatExist (_idCandidat) {
        require(electeurs[msg.sender].mintOk, "Nft needed");
        require(!electeurs[msg.sender].voteOk, "Vote already done");
        require(voteOuvert,"Vote not started");

        electeurs[msg.sender].voteOk = true;
        countVote += 1;
        votes[_idCandidat] += 1;
    }

    /// @notice Return the counter of vote to this Candidat
    /// @param _idCandidat index of the Candidat you want to get the vote
    function getVote(uint _idCandidat) public view returns (uint) {
        return votes[_idCandidat];
    }

    /// @notice substract the number of CE with the number of vote to get Vote blanc
    /// @notice create an array of numbers, and foreach i push the numbers of vote in it
    /// @return the number of Vote Blanc
    /// @return an array with the number of Votes foreach index
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

    /// @notice return the bool of VoteOuvert (vote ouvert : true)
    function getVoteStarted() public view returns (bool) {
        return voteOuvert;
    }

    /// @notice Start the vote (voteOuvert = true) and pause the mint of CE
    function startVote() public onlyOwner {
        //ouvre les votes
        voteOuvert = true;
        //pause mint
        ce.pause();
    }

    /// @notice Stop/end the vote (voteOuvert = false)
    function voteOver() public onlyOwner {
        voteOuvert = false;
    }

    /// @notice Pause the CE contract
    function pause() public onlyOwner {
        ce.pause();
    }

    /// @notice Unpause the CE contract
    function unpause() public onlyOwner {
        ce.unpause();
    }

}