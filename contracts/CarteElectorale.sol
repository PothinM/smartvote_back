// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

//tampon quand vote 1 puis tampon vote 2

//nb de nft minté (pour calculer le taux d'abstention)

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol"; 
import "@openzeppelin/contracts/security/Pausable.sol";
 
contract CarteElectorale is ERC721, ERC721URIStorage, Pausable, Ownable {
    using Counters for Counters.Counter;
 
    Counters.Counter private _tokenIdCounter;
    uint256 private carteElectoraleCounter = 0;
    constructor() ERC721("CarteElectorale", "CEF") {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721)
    {
        require(from == address(0), "Token not transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function getCarteElectoraleCounter() public view returns (uint) {
        return carteElectoraleCounter;
    }

    function safeMint(address to) public onlyOwner {
        carteElectoraleCounter +=1; //increment of tokencounter
                
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
 
    // The following functions are overrides required by Solidity.
 
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
 
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}