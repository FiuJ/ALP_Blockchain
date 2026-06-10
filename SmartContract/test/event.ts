import "@nomicfoundation/hardhat-toolbox-viem";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("Smart Contract Events Verification", async function () {
    const { viem } = await network.create();

  // ==================================================================
  // FIXTURE: Mendeploy kontrak bersih untuk setiap skenario pengujian
  // ==================================================================
  async function deployContracts() {
    const publicClient = await viem.getPublicClient();
    const walletClients = await viem.getWalletClients();

    const owner = walletClients[0];
    const doctor = walletClients[1];
    const patient = walletClients[2];

    const doctorRegistry = await viem.deployContract("DoctorRegistry");
    const patientRegistry = await viem.deployContract("PatientRegistry");
    const medicalDocumentNFT = await viem.deployContract("MedicalDocumentNFT", [
      doctorRegistry.address,
      patientRegistry.address,
    ]);

    return {
      doctorRegistry,
      patientRegistry,
      medicalDocumentNFT,
      publicClient,
      owner,
      doctor,
      patient,
    };
  }

  // ==================================================================
  // TEST CASES: EVENT TESTING
  // ==================================================================

  it("1. Harus memancarkan event PatientRegistered saat pasien mendaftar", async () => {
    const { patientRegistry, patient, publicClient } = await deployContracts();

    // Eksekusi registrasi pasien
    const tx = await patientRegistry.write.registerPatient({ account: patient.account });
    await publicClient.waitForTransactionReceipt({ hash: tx });

    // Mengambil log event PatientRegistered
    const events = await patientRegistry.getEvents.PatientRegistered();
    
    // Pastikan event memancar tepat 1 kali
    assert.equal(events.length, 1, "Event PatientRegistered tidak terpancar");
    
    // Pastikan parameter indexed (patientAddress) nilainya cocok dengan dompet pasien
    assert.equal(
      events[0].args.patientAddress?.toLowerCase(),
      patient.account.address.toLowerCase(),
      "Data address pasien di dalam event tidak cocok"
    );
  });

  it("2. Harus memancarkan event DoctorRegistered saat dokter mengajukan pendaftaran", async () => {
    const { doctorRegistry, doctor, publicClient } = await deployContracts();

    // Dokter melakukan registrasi awal
    const tx = await doctorRegistry.write.registerDoctor({ account: doctor.account });
    await publicClient.waitForTransactionReceipt({ hash: tx });

    // Ambil log event DoctorRegistered
    const events = await doctorRegistry.getEvents.DoctorRegistered();
    
    assert.equal(events.length, 1, "Event DoctorRegistered tidak terpancar");
    assert.equal(
      events[0].args.doctorAddress?.toLowerCase(),
      doctor.account.address.toLowerCase(),
      "Data address dokter di dalam event tidak cocok"
    );
  });

  it("3. Harus memancarkan event DoctorVerified saat Admin menyetujui dokter", async () => {
    const { doctorRegistry, owner, doctor, publicClient } = await deployContracts();

    // Dokter daftar dulu
    await doctorRegistry.write.registerDoctor({ account: doctor.account });

    // Admin/Owner melakukan verifikasi dokter
    const tx = await doctorRegistry.write.verifyDoctor([doctor.account.address], { account: owner.account });
    await publicClient.waitForTransactionReceipt({ hash: tx });

    // Ambil log event DoctorVerified
    const events = await doctorRegistry.getEvents.DoctorVerified();
    
    assert.equal(events.length, 1, "Event DoctorVerified tidak terpancar");
    assert.equal(
      events[0].args.doctorAddress?.toLowerCase(),
      doctor.account.address.toLowerCase()
    );
  });

  it("4. Harus memancarkan event DoctorRevoked saat Admin mencabut lisensi dokter", async () => {
    const { doctorRegistry, owner, doctor, publicClient } = await deployContracts();

    // Alur: Daftar -> Verify -> Revoke
    await doctorRegistry.write.registerDoctor({ account: doctor.account });
    await doctorRegistry.write.verifyDoctor([doctor.account.address], { account: owner.account });

    // Admin mencabut status verifikasi dokter
    const tx = await doctorRegistry.write.revokeDoctor([doctor.account.address], { account: owner.account });
    await publicClient.waitForTransactionReceipt({ hash: tx });

    // Ambil log event DoctorRevoked
    const events = await doctorRegistry.getEvents.DoctorRevoked();
    
    assert.equal(events.length, 1, "Event DoctorRevoked tidak terpancar");
    assert.equal(
      events[0].args.doctorAddress?.toLowerCase(),
      doctor.account.address.toLowerCase()
    );
  });

  it("5. Harus memancarkan event Transfer (Minting ERC721) saat dokumen diterbitkan", async () => {
    const { doctorRegistry, patientRegistry, medicalDocumentNFT, owner, doctor, patient, publicClient } = await deployContracts();

    // Kondisi Prasyarat: Daftarkan pasien & dokter secara legal
    await patientRegistry.write.registerPatient({ account: patient.account });
    await doctorRegistry.write.registerDoctor({ account: doctor.account });
    await doctorRegistry.write.verifyDoctor([doctor.account.address], { account: owner.account });

    // Dokter menerbitkan dokumen (Minting NFT)
    const tx = await medicalDocumentNFT.write.issueDocument(
      ["0xDocumentHashHere", "ipfs://token-metadata-uri", patient.account.address, 0n],
      { account: doctor.account }
    );
    await publicClient.waitForTransactionReceipt({ hash: tx });

    // Mengambil log event Transfer bawaan OpenZeppelin ERC721
    const transferEvents = await medicalDocumentNFT.getEvents.Transfer();
    
    assert.equal(transferEvents.length, 1, "Event Transfer NFT tidak terpancar");
    
    // Pada proses Minting, pengirim asal ('from') di blockchain selalu address nol (0x0000...)
    assert.equal(
      transferEvents[0].args.from,
      "0x0000000000000000000000000000000000000000",
      "Proses minting seharusnya berasal dari address nol"
    );

    // Penerima ('to') harus alamat pasien
    assert.equal(
      transferEvents[0].args.to?.toLowerCase(),
      patient.account.address.toLowerCase(),
      "NFT gagal ditransfer ke address pasien tujuan"
    );

    // Pastikan Token ID pertama yang dibuat bermula dari angka 0
    assert.equal(transferEvents[0].args.tokenId, 0n, "Token ID pertama harus bernilai 0");
  });
});