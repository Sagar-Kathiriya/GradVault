// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IssuerRegistry {
    address public owner;
    mapping(address => bool) public isIssuer;
    mapping(address => string) public issuerDid;

    event IssuerRegistered(address indexed issuer, string did);
    event IssuerUnregistered(address indexed issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerIssuer(address _issuer, string memory _did) external onlyOwner {
        require(!isIssuer[_issuer], "already registered");
        isIssuer[_issuer] = true;
        issuerDid[_issuer] = _did;
        emit IssuerRegistered(_issuer, _did);
    }

    function unregisterIssuer(address _issuer) external onlyOwner {
        require(isIssuer[_issuer], "not registered");
        isIssuer[_issuer] = false;
        delete issuerDid[_issuer];
        emit IssuerUnregistered(_issuer);
    }

    function getIssuerDid(address _issuer) external view returns (string memory) {
        require(isIssuer[_issuer], "not registered");
        return issuerDid[_issuer];
    }
}
