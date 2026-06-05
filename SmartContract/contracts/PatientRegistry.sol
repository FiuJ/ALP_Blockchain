// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract PatientRegistry {
    struct Patient {
       
        bool isRegistered;
    }

    mapping(address => Patient) public patients;

    event PatientRegistered(address indexed patientAddress);

    function registerPatient() public {
        require(!patients[msg.sender].isRegistered, "Patient already registered");

        patients[msg.sender] = Patient({
            isRegistered: true
        });

        emit PatientRegistered(msg.sender);
    }

    // Fungsi eksternal untuk dipanggil oleh kontrak NFT
    function isRegisteredPatient(address patientAddress) external view returns (bool) {
        return patients[patientAddress].isRegistered;
    }
}