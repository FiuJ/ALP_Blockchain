import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Medical Document System", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMedicalSystemFixture() {
    // Get the signers (accounts) available in the local node
    const [owner, doctorAccount, patientAccount, unauthorizedAccount] = await hre.viem.getWalletClients();

    // 1. Deploy Patient Registry
    const patientRegistry = await hre.viem.deployContract("PatientRegistry");

    // 2. Deploy Doctor Registry
    const doctorRegistry = await hre.viem.deployContract("DoctorRegistry");

    // 3. Deploy Medical Document NFT
    // Assuming the NFT contract requires the addresses of the registries to verify permissions
    const medicalDocumentNFT = await hre.viem.deployContract("MedicalDocumentNFT", [
      patientRegistry.address,
      doctorRegistry.address
    ]);

    // Return all deployed instances and accounts so we can use them in tests
    return {
      patientRegistry,
      doctorRegistry,
      medicalDocumentNFT,
      owner,
      doctorAccount,
      patientAccount,
      unauthorizedAccount,
      publicClient: await hre.viem.getPublicClient(),
    };
  }

  describe("Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      const { patientRegistry, doctorRegistry, medicalDocumentNFT } = await loadFixture(deployMedicalSystemFixture);
      
      expect(patientRegistry.address).to.not.be.undefined;
      expect(doctorRegistry.address).to.not.be.undefined;
      expect(medicalDocumentNFT.address).to.not.be.undefined;
    });
  });

  describe("PatientRegistry", function () {
    it("Should allow a new patient to register", async function () {
      const { patientRegistry, patientAccount } = await loadFixture(deployMedicalSystemFixture);

      // Call register function as the patient account
      // Adjust parameters based on your actual contract's input requirements
      const patientRegistryAsPatient = await hre.viem.getContractAt(
        "PatientRegistry",
        patientRegistry.address,
        { client: { wallet: patientAccount } }
      );

      await patientRegistryAsPatient.write.registerPatient(["Alice", 30, "Female"]);

      // Verify patient data
      const patientData = await patientRegistry.read.getPatient([patientAccount.account.address]);
      expect(patientData.name).to.equal("Alice");
    });
  });

  describe("DoctorRegistry", function () {
    it("Should allow the owner to register a doctor", async function () {
      const { doctorRegistry, doctorAccount } = await loadFixture(deployMedicalSystemFixture);

      // Register doctor
      await doctorRegistry.write.registerDoctor([doctorAccount.account.address, "Dr. Smith", "Cardiology"]);

      // Verify doctor is registered
      const isRegistered = await doctorRegistry.read.isDoctor([doctorAccount.account.address]);
      expect(isRegistered).to.be.true;
    });
  });

  describe("MedicalDocumentNFT", function () {
    it("Should allow an authorized doctor to mint a medical document to a patient", async function () {
      const { patientRegistry, doctorRegistry, medicalDocumentNFT, doctorAccount, patientAccount } = await loadFixture(deployMedicalSystemFixture);

      // 1. Setup: Register Patient
      const patientRegistryAsPatient = await hre.viem.getContractAt(
        "PatientRegistry",
        patientRegistry.address,
        { client: { wallet: patientAccount } }
      );
      await patientRegistryAsPatient.write.registerPatient(["Alice", 30, "Female"]);

      // 2. Setup: Register Doctor
      await doctorRegistry.write.registerDoctor([doctorAccount.account.address, "Dr. Smith", "Cardiology"]);

      // 3. Switch to Doctor's account to mint the document
      const nftAsDoctor = await hre.viem.getContractAt(
        "MedicalDocumentNFT",
        medicalDocumentNFT.address,
        { client: { wallet: doctorAccount } }
      );

      // Mint NFT (IPFS URI representing the document)
      const tokenURI = "ipfs://QmYourDocumentHashHere";
      await nftAsDoctor.write.mintDocument([patientAccount.account.address, tokenURI]);

      // 4. Validate Minting
      const balance = await medicalDocumentNFT.read.balanceOf([patientAccount.account.address]);
      expect(balance).to.equal(1n); // BigInt formatting for Viem
    });

    it("Should fail if an unauthorized person tries to mint", async function () {
      const { medicalDocumentNFT, unauthorizedAccount, patientAccount } = await loadFixture(deployMedicalSystemFixture);

      const nftAsUnauthorized = await hre.viem.getContractAt(
        "MedicalDocumentNFT",
        medicalDocumentNFT.address,
        { client: { wallet: unauthorizedAccount } }
      );

      const tokenURI = "ipfs://QmYourDocumentHashHere";
      
      // Attempting to mint should revert because unauthorizedAccount is not a registered doctor
      await expect(
        nftAsUnauthorized.write.mintDocument([patientAccount.account.address, tokenURI])
      ).to.be.rejectedWith("Unauthorized: Caller is not a registered doctor"); 
      // Update the rejection string to match the exact error thrown in your Solidity require/revert.
    });
  });
});