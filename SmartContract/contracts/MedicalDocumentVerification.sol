// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract MedicalDocumentVerification {
    address public owner;

    // Struct Data
    struct Doctor {
        string name;
        string doctorLicenseNumber;
        string specialization;
        string clinicName;
        string clinicLocation;
        bool isVerified;
        bool isRegistered;
    }

    struct Patient {
        string name;
        string patientId;
        bool isRegistered;
    }

    struct MedicalDocument {
        string documentHash;
        string filePath;
        string documentType;
        address issuer;
        address patient;
        uint256 issuedAt;
        uint256 expiredAt;
        bool isValid;
    }

    struct VerificationRecord {
        address verifier;
        string documentHash;
        uint256 verifiedAt;
        bool verificationResult;
    }

    //  Mapping 
    mapping(address => Doctor) public doctors;
    mapping(address => Patient) public patients;
    mapping(string => MedicalDocument) public medicalDocuments;
    mapping(string => VerificationRecord[]) public verificationRecords;

    //  Modifier 
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can access");
        _;
    }

    modifier onlyVerifiedDoctor() {
        require(doctors[msg.sender].isVerified, "Doctor is not verified");
        _;
    }

    modifier onlyRegisteredPatient() {
        require(patients[msg.sender].isRegistered, "Patient is not registered");
        _;
    }

    modifier documentExists(string memory documentHash) {
        require(
            medicalDocuments[documentHash].issuedAt != 0,
            "Document does not exist"
        );
        _;
    }

    // Events 
    event DoctorRegistered(address indexed doctorAddress, string doctorName);
    event PatientRegistered(address indexed patientAddress, string patientName);
    event DoctorVerified(address indexed doctorAddress);
    event DoctorRevoked(address indexed doctorAddress);
    event DocumentIssued(
        string documentHash,
        address indexed issuer,
        address indexed patient,
        uint256 issuedAt
    );
    event DocumentVerified(
        string documentHash,
        address indexed verifier,
        bool verificationResult
    );
    event DocumentRevoked(string documentHash, address indexed issuer);

    //  Constructor 
    constructor() {
        owner = msg.sender;
    }

    //  Functions 

    // Fitur 1: Registrasi Dokter
    function registerDoctor(
        string memory name,
        string memory doctorLicenseNumber,
        string memory specialization,
        string memory clinicName,
        string memory clinicLocation
    ) public {
        require(!doctors[msg.sender].isRegistered, "Doctor already registered");

        doctors[msg.sender] = Doctor({
            name: name,
            doctorLicenseNumber: doctorLicenseNumber,
            specialization: specialization,
            clinicName: clinicName,
            clinicLocation: clinicLocation,
            isVerified: false,
            isRegistered: true
        });

        emit DoctorRegistered(msg.sender, name);
    }

    
    function registerPatient(
        string memory name,
        string memory patientId
    ) public {
        require(
            !patients[msg.sender].isRegistered,
            "Patient already registered"
        );

        patients[msg.sender] = Patient({
            name: name,
            patientId: patientId,
            isRegistered: true
        });

        emit PatientRegistered(msg.sender, name);
    }

    function verifyDoctor(address doctorAddress) public onlyOwner {
        require(
            doctors[doctorAddress].isRegistered,
            "Doctor is not registered"
        );
        require(
            !doctors[doctorAddress].isVerified,
            "Doctor is already verified"
        );

        doctors[doctorAddress].isVerified = true;
        emit DoctorVerified(doctorAddress);
    }

    function revokeDoctor(address doctorAddress) public onlyOwner {
        require(
            doctors[doctorAddress].isRegistered,
            "Doctor is not registered"
        );
        require(
            doctors[doctorAddress].isVerified,
            "Doctor is not verified yet"
        );

        doctors[doctorAddress].isVerified = false;
        emit DoctorRevoked(doctorAddress);
    }

    function isVerifiedDoctor(
        address doctorAddress
    ) public view returns (bool) {
        return doctors[doctorAddress].isVerified;
    }

    function issueDocument(
        string memory documentHash,
        string memory filePath,
        string memory documentType,
        string memory documentDescription, // Parameter ini tidak disimpan di struct on-chain untuk menghemat gas, bisa disimpan di MySQL
        address patientAddress,
        uint256 expiredAt
    ) public onlyVerifiedDoctor {
        require(
            medicalDocuments[documentHash].issuedAt == 0,
            "Document hash already exists"
        );
        require(
            patients[patientAddress].isRegistered,
            "Patient is not registered"
        );

        medicalDocuments[documentHash] = MedicalDocument({
            documentHash: documentHash,
            filePath: filePath,
            documentType: documentType,
            issuer: msg.sender,
            patient: patientAddress,
            issuedAt: block.timestamp,
            expiredAt: expiredAt,
            isValid: true
        });

        emit DocumentIssued(
            documentHash,
            msg.sender,
            patientAddress,
            block.timestamp
        );
    }

    function verifyDocument(
        string memory documentHash
    ) public documentExists(documentHash) returns (bool) {
        bool currentValidity = medicalDocuments[documentHash].isValid;

        if (
            medicalDocuments[documentHash].expiredAt > 0 &&
            block.timestamp > medicalDocuments[documentHash].expiredAt
        ) {
            currentValidity = false;
        }

        verificationRecords[documentHash].push(
            VerificationRecord({
                verifier: msg.sender,
                documentHash: documentHash,
                verifiedAt: block.timestamp,
                verificationResult: currentValidity
            })
        );

        emit DocumentVerified(documentHash, msg.sender, currentValidity);
        return currentValidity;
    }

   
    function revokeDocument(
        string memory documentHash
    ) public onlyVerifiedDoctor documentExists(documentHash) {
        require(
            medicalDocuments[documentHash].issuer == msg.sender,
            "Only the issuing doctor can revoke this document"
        );
        require(
            medicalDocuments[documentHash].isValid,
            "Document is already revoked or invalid"
        );

        medicalDocuments[documentHash].isValid = false;

        emit DocumentRevoked(documentHash, msg.sender);
    }

    function getDocumentDetails(
        string memory documentHash
    )
        public
        view
        documentExists(documentHash)
        returns (
            string memory,
            string memory,
            string memory,
            address,
            address,
            uint256,
            uint256,
            bool
        )
    {
        MedicalDocument memory doc = medicalDocuments[documentHash];

        bool currentValidity = doc.isValid;
        if (doc.expiredAt > 0 && block.timestamp > doc.expiredAt) {
            currentValidity = false;
        }

        return (
            doc.documentHash,
            doc.filePath,
            doc.documentType,
            doc.issuer,
            doc.patient,
            doc.issuedAt,
            doc.expiredAt,
            currentValidity
        );
    }

    function getVerificationHistory(
        string memory documentHash
    ) public view returns (VerificationRecord[] memory) {
        return verificationRecords[documentHash];
    }

    function getDoctorDetails(
        address doctorAddress
    )
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            bool,
            bool
        )
    {
        Doctor memory doc = doctors[doctorAddress];
        return (
            doc.name,
            doc.doctorLicenseNumber,
            doc.specialization,
            doc.clinicName,
            doc.clinicLocation,
            doc.isVerified,
            doc.isRegistered
        );
    }

    function getPatientDetails(
        address patientAddress
    ) public view returns (string memory, string memory, bool) {
        Patient memory pat = patients[patientAddress];
        return (pat.name, pat.patientId, pat.isRegistered);
    }
}
