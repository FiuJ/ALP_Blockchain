// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract PatientRegistry {
    struct Patient {
        string name;
        string patientId;
        bool isRegistered;
    }

    mapping(address => Patient) public patients;

    event PatientRegistered(address indexed patientAddress, string patientName);

    function registerPatient(string memory name, string memory patientId) public {
        require(!patients[msg.sender].isRegistered, "Patient already registered");

        patients[msg.sender] = Patient({
            name: name,
            patientId: patientId,
            isRegistered: true
        });

        emit PatientRegistered(msg.sender, name);
    }

    // Fungsi eksternal untuk dipanggil oleh kontrak NFT
    function isRegisteredPatient(address patientAddress) external view returns (bool) {
        return patients[patientAddress].isRegistered;
    }
}