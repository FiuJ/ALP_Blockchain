import "@nomicfoundation/hardhat-toolbox-viem";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("MedicalDocumentVerification - Event Tests", async function () {
  const { viem } = await network.create();

  async function deployContracts() {
    const publicClient = await viem.getPublicClient();
    const walletClients = await viem.getWalletClients();
    const contract = await viem.deployContract("MedicalDocumentVerification");
    return { contract, walletClients };
  }

  it("Test Event: DoctorRegistered & DoctorVerified & DoctorRevoked", async function () {
    const { contract, walletClients } = await deployContracts();
    const [owner, doctor] = walletClients;

    // 1. Register
    await contract.write.registerDoctor(["Dr. A", "S1", "U", "K", "S"], { account: doctor.account });
    const regLogs = await contract.getEvents.DoctorRegistered();
    assert.equal(regLogs[0].args.doctorName, "Dr. A");

    // 2. Verify
    await contract.write.verifyDoctor([doctor.account.address], { account: owner.account });
    const verLogs = await contract.getEvents.DoctorVerified();
    assert.equal(verLogs[0].args.doctorAddress?.toLowerCase(), doctor.account.address.toLowerCase());

    // 3. Revoke
    await contract.write.revokeDoctor([doctor.account.address], { account: owner.account });
    const revLogs = await contract.getEvents.DoctorRevoked();
    assert.equal(revLogs[0].args.doctorAddress?.toLowerCase(), doctor.account.address.toLowerCase());
  });

  it("Test Event: PatientRegistered", async function () {
    const { contract, walletClients } = await deployContracts();
    const patient = walletClients[2];

    await contract.write.registerPatient(["Andi", "RM-001"], { account: patient.account });
    const logs = await contract.getEvents.PatientRegistered();
    assert.equal(logs[0].args.patientName, "Andi");
    assert.equal(logs[0].args.patientAddress?.toLowerCase(), patient.account.address.toLowerCase());
  });

  it("Test Event: DocumentIssued & DocumentVerified & DocumentRevoked", async function () {
    const { contract, walletClients } = await deployContracts();
    const [owner, doctor, patient, verifier] = walletClients;

    // Setup
    await contract.write.registerDoctor(["Dr. A", "S1", "U", "K", "S"], { account: doctor.account });
    await contract.write.verifyDoctor([doctor.account.address], { account: owner.account });
    await contract.write.registerPatient(["P1", "ID1"], { account: patient.account });
    const docHash = "0xABC";

    // 1. Issue
    await contract.write.issueDocument([docHash, "/path", "Sakit", "Desc", patient.account.address, 9999999999n], { account: doctor.account });
    const issueLogs = await contract.getEvents.DocumentIssued();
    assert.equal(issueLogs[0].args.documentHash, docHash);

    // 2. Verify
    await contract.write.verifyDocument([docHash], { account: verifier.account });
    const verLogs = await contract.getEvents.DocumentVerified();
    assert.equal(verLogs[0].args.documentHash, docHash);
    assert.equal(verLogs[0].args.verificationResult, true);

    // 3. Revoke
    await contract.write.revokeDocument([docHash], { account: doctor.account });
    const revLogs = await contract.getEvents.DocumentRevoked();
    assert.equal(revLogs[0].args.documentHash, docHash);
    assert.equal(revLogs[0].args.issuer?.toLowerCase(), doctor.account.address.toLowerCase());
  });
});