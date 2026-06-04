// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract DoctorRegistry {
    address public owner;

    struct Doctor {
        string name;
        string doctorLicenseNumber;
        string specialization;
        string clinicName;
        string clinicLocation;
        bool isVerified;
        bool isRegistered;
    }

    mapping(address => Doctor) public doctors;

    event DoctorRegistered(address indexed doctorAddress, string doctorName);
    event DoctorVerified(address indexed doctorAddress);
    event DoctorRevoked(address indexed doctorAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can access");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

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

    function verifyDoctor(address doctorAddress) public onlyOwner {
        require(doctors[doctorAddress].isRegistered, "Doctor is not registered");
        require(!doctors[doctorAddress].isVerified, "Doctor is already verified");

        doctors[doctorAddress].isVerified = true;
        emit DoctorVerified(doctorAddress);
    }

    function revokeDoctor(address doctorAddress) public onlyOwner {
        require(doctors[doctorAddress].isRegistered, "Doctor is not registered");
        require(doctors[doctorAddress].isVerified, "Doctor is not verified yet");

        doctors[doctorAddress].isVerified = false;
        emit DoctorRevoked(doctorAddress);
    }

    // Fungsi eksternal untuk dipanggil oleh kontrak NFT
    function isVerifiedDoctor(address doctorAddress) external view returns (bool) {
        return doctors[doctorAddress].isVerified;
    }
}