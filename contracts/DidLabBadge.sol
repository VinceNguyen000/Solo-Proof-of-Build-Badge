// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DidLabBadge is ERC721, Ownable {
    uint256 public nextId = 1;
    mapping(uint256 => string) private _tokenURIs;

    event BadgeMinted(address indexed to, uint256 indexed tokenId, string uri);
    error NonTransferable();

    constructor(address initialOwner)
        ERC721("DIDLab Hackathon Badge", "DLHB")
        Ownable(initialOwner)
    {}

    function mintTo(address to, string memory uri) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        emit BadgeMinted(to, tokenId, uri);
    }

    // Batch mint (same URI)
    function mintMany(address[] calldata recipients, string calldata uri) external onlyOwner {
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = nextId++;
            _safeMint(recipients[i], tokenId);
            _tokenURIs[tokenId] = uri;
            emit BadgeMinted(recipients[i], tokenId, uri);
        }
    }

    // Optional: update metadata
    function setTokenURI(uint256 tokenId, string calldata newURI) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "no token");
        _tokenURIs[tokenId] = newURI;
    }

    // Soulbound: disallow transfers (but allow mint/burn)
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert NonTransferable();
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public override {
        revert NonTransferable();
    }

    function setApprovalForAll(address, bool) public override {
        revert NonTransferable();
    }

    // Burn by holder or contract owner
    function burn(uint256 tokenId) external {
        address holder = _ownerOf(tokenId);
        require(holder != address(0), "no token");
        require(msg.sender == holder || msg.sender == owner(), "not authorized");
        _burn(tokenId);
        delete _tokenURIs[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "no token");
        return _tokenURIs[tokenId];
    }
}
