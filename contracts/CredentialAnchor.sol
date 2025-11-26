// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CredentialAnchor {
    address public owner;

    struct Anchor {
        address issuer;
        uint256 timestamp;
        bool revoked;
    }

    mapping(bytes32 => Anchor) private anchors;

    event Anchored(bytes32 indexed anchor, address indexed issuer, uint256 timestamp);
    event Revoked(bytes32 indexed anchor, address indexed by, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function anchorCredential(bytes32 _anchor) external {
        require(anchors[_anchor].timestamp == 0, "already anchored");
        anchors[_anchor] = Anchor({issuer: msg.sender, timestamp: block.timestamp, revoked: false});
        emit Anchored(_anchor, msg.sender, block.timestamp);
    }

    function revokeCredential(bytes32 _anchor) external {
        require(anchors[_anchor].timestamp != 0, "not anchored");
        Anchor storage a = anchors[_anchor];
        require(!a.revoked, "already revoked");
        require(msg.sender == a.issuer || msg.sender == owner, "not authorized");
        a.revoked = true;
        emit Revoked(_anchor, msg.sender, block.timestamp);
    }

    function isAnchored(bytes32 _anchor) external view returns (bool) {
        return anchors[_anchor].timestamp != 0;
    }

    function isRevoked(bytes32 _anchor) external view returns (bool) {
        return anchors[_anchor].revoked;
    }

    function getAnchor(bytes32 _anchor) external view returns (address issuer, uint256 timestamp, bool revoked) {
        Anchor storage a = anchors[_anchor];
        require(a.timestamp != 0, "not anchored");
        return (a.issuer, a.timestamp, a.revoked);
    }

    // Owner convenience: set a new owner
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "zero address");
        owner = _newOwner;
    }
}
