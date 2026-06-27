// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Wei Name Service (WNS)
 * @dev A decentralized domain name service for Ethereum (mainnet)
 * Allows users to register, own, and transfer .wei domains as NFTs
 */
contract WeiNameService is ERC721, Ownable {
    uint256 private tokenIdCounter = 1;
    uint256 public registrationPrice = 0.1 ether;
    
    // Mapping of domain name hash to owner address
    mapping(bytes32 => address) private domainOwners;
    
    // Mapping of domain name hash to registration timestamp
    mapping(bytes32 => uint256) private registrationTimestamp;
    
    // Mapping of domain name hash to expiration timestamp
    mapping(bytes32 => uint256) private expirationTimestamp;
    
    // Mapping of owner address to their domain names
    mapping(address => string[]) private userDomains;
    
    // Events
    event DomainRegistered(
        address indexed owner,
        string domainName,
        uint256 indexed tokenId,
        uint256 timestamp,
        uint256 expiresAt
    );
    
    event DomainTransferred(
        address indexed from,
        address indexed to,
        string domainName
    );
    
    event DomainRenewed(
        address indexed owner,
        string domainName,
        uint256 expiresAt
    );
    
    constructor() ERC721("Wei Name Service", "WNS") {}
    
    /**
     * @dev Register a new .wei domain
     * @param domainName The name to register (without .wei suffix)
     */
    function register(string memory domainName) public payable {
        require(msg.value >= registrationPrice, "Insufficient payment");
        require(bytes(domainName).length >= 3, "Domain name too short");
        
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        require(
            domainOwners[domainHash] == address(0),
            "Domain already registered"
        );
        
        uint256 tokenId = tokenIdCounter;
        tokenIdCounter++;
        
        // Set ownership
        domainOwners[domainHash] = msg.sender;
        registrationTimestamp[domainHash] = block.timestamp;
        expirationTimestamp[domainHash] = block.timestamp + 365 days;
        userDomains[msg.sender].push(domainName);
        
        // Mint NFT
        _safeMint(msg.sender, tokenId);
        
        emit DomainRegistered(
            msg.sender,
            domainName,
            tokenId,
            block.timestamp,
            expirationTimestamp[domainHash]
        );
    }
    
    /**
     * @dev Check if a domain is available
     * @param domainName The domain name to check
     * @return true if available, false if taken
     */
    function checkAvailability(string memory domainName)
        public
        view
        returns (bool)
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        return domainOwners[domainHash] == address(0);
    }
    
    /**
     * @dev Get the owner of a domain
     * @param domainName The domain name
     * @return The owner's address, or zero address if not registered
     */
    function getDomainOwner(string memory domainName)
        public
        view
        returns (address)
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        return domainOwners[domainHash];
    }
    
    /**
     * @dev Get all domains owned by an address
     * @param owner The owner address
     * @return Array of domain names
     */
    function getUserDomains(address owner)
        public
        view
        returns (string[] memory)
    {
        return userDomains[owner];
    }
    
    /**
     * @dev Renew a domain registration for another year
     * @param domainName The domain to renew
     */
    function renewDomain(string memory domainName) public payable {
        require(msg.value >= registrationPrice, "Insufficient payment");
        
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        require(domainOwners[domainHash] == msg.sender, "Not domain owner");
        
        expirationTimestamp[domainHash] += 365 days;
        
        emit DomainRenewed(msg.sender, domainName, expirationTimestamp[domainHash]);
    }
    
    /**
     * @dev Transfer a domain to another address
     * @param domainName The domain to transfer
     * @param to The recipient address
     */
    function transferDomain(string memory domainName, address to) public {
        require(to != address(0), "Invalid recipient");
        
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        require(domainOwners[domainHash] == msg.sender, "Not domain owner");
        
        domainOwners[domainHash] = to;
        
        // Update user domains
        for (uint256 i = 0; i < userDomains[msg.sender].length; i++) {
            if (
                keccak256(abi.encodePacked(userDomains[msg.sender][i])) ==
                domainHash
            ) {
                userDomains[msg.sender][i] = userDomains[msg.sender][
                    userDomains[msg.sender].length - 1
                ];
                userDomains[msg.sender].pop();
                break;
            }
        }
        userDomains[to].push(domainName);
        
        emit DomainTransferred(msg.sender, to, domainName);
    }
    
    /**
     * @dev Update registration price (owner only)
     * @param newPrice The new price in wei
     */
    function setRegistrationPrice(uint256 newPrice) public onlyOwner {
        registrationPrice = newPrice;
    }
    
    /**
     * @dev Withdraw collected fees (owner only)
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Get domain expiration timestamp
     * @param domainName The domain name
     * @return Unix timestamp of expiration
     */
    function getExpirationTime(string memory domainName)
        public
        view
        returns (uint256)
    {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName));
        return expirationTimestamp[domainHash];
    }
}
