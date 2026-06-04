// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Interface untuk berkomunikasi dengan Registry Contract
interface IDoctorRegistry {
    function isVerifiedDoctor(address doctorAddress) external view returns (bool);
}

interface IPatientRegistry {
    function isRegisteredPatient(address patientAddress) external view returns (bool);
}

contract MedicalDocumentNFT is ERC721URIStorage {
    IDoctorRegistry public doctorRegistry;
    IPatientRegistry public patientRegistry;
    
    uint256 private _nextTokenId;

    struct MedicalDocument {
        string documentHash;
        string documentType;
        address issuer;
        address patient;
        uint256 issuedAt;
        uint256 expiredAt;
        bool isValid;
    }

    struct VerificationRecord {
        address verifier;
        uint256 verifiedAt;
        bool verificationResult;
    }

    // Mapping kini menggunakan tokenId (NFT) sebagai key utama
    mapping(uint256 => MedicalDocument) public medicalDocuments;
    mapping(uint256 => VerificationRecord[]) public verificationRecords;

    modifier onlyVerifiedDoctor() {
        require(doctorRegistry.isVerifiedDoctor(msg.sender), "Doctor is not verified");
        _;
    }

    // Menginjeksikan address registry saat deploy
    constructor(address _doctorRegistryAddress, address _patientRegistryAddress) 
        ERC721("Medical Document", "MEDDOC") 
    {
        doctorRegistry = IDoctorRegistry(_doctorRegistryAddress);
        patientRegistry = IPatientRegistry(_patientRegistryAddress);
    }

    function issueDocument(
        string memory documentHash,
        string memory documentType,
        string memory tokenURI, 
        address patientAddress,
        uint256 expiredAt
    ) public onlyVerifiedDoctor {
        require(patientRegistry.isRegisteredPatient(patientAddress), "Patient is not registered");

        uint256 tokenId = _nextTokenId++;
        
        // Menerbitkan (Minting) NFT ke pasien
        _mint(patientAddress, tokenId);
        _setTokenURI(tokenId, tokenURI);

        medicalDocuments[tokenId] = MedicalDocument({
            documentHash: documentHash,
            documentType: documentType,
            issuer: msg.sender,
            patient: patientAddress,
            issuedAt: block.timestamp,
            expiredAt: expiredAt,
            isValid: true
        });
    }

    // PERBAIKAN: Verifikasi menggunakan NFT secara langsung
    function verifyDocumentByNFT(uint256 tokenId) public returns (bool) {
        // 1. Verifikasi Kepemilikan & Keberadaan NFT (Fungsi bawaan ERC721)
        // Jika tokenId tidak ada, fungsi ownerOf akan otomatis menggagalkan (revert) transaksi
        address tokenOwner = ownerOf(tokenId);
        require(tokenOwner != address(0), "NFT Document is invalid or burned");

        MedicalDocument memory doc = medicalDocuments[tokenId];
        bool currentValidity = doc.isValid;

        // 2. Cek masa kedaluwarsa
        if (doc.expiredAt > 0 && block.timestamp > doc.expiredAt) {
            currentValidity = false;
        }

        // 3. Catat rekam jejak verifikasi
        verificationRecords[tokenId].push(
            VerificationRecord({
                verifier: msg.sender,
                verifiedAt: block.timestamp,
                verificationResult: currentValidity
            })
        );

        return currentValidity;
    }

    function revokeDocument(uint256 tokenId) public onlyVerifiedDoctor {
        require(medicalDocuments[tokenId].issuer == msg.sender, "Only the issuing doctor can revoke");
        require(medicalDocuments[tokenId].isValid, "Document is already revoked");

        medicalDocuments[tokenId].isValid = false;
    }

    function getVerificationHistory(uint256 tokenId) public view returns (VerificationRecord[] memory) {
        return verificationRecords[tokenId];
    }

    // PERBAIKAN: Hook Soulbound Token (SBT) untuk OpenZeppelin v5
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        
        // Mengizinkan proses Minting (dari address(0)) dan Burning (ke address(0))
        // Namun akan menggagalkan jika terjadi transfer antar-wallet biasa
        require(
            from == address(0) || to == address(0),
            "Medical documents are Soulbound and cannot be transferred"
        );

        return super._update(to, tokenId, auth);
    }
}