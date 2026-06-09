import "@nomicfoundation/hardhat-toolbox-viem"; // Menyuntikkan tipe ke proyek
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("MedicalDocumentVerification", async function () {
  const { viem } = await network.create();
  // ==================================================================
  // FIXTURE: Fungsi pembantu untuk mendeploy ulang kontrak dengan state bersih
  // ==================================================================
  async function deployContracts() {
    const publicClient = await viem.getPublicClient();
    const walletClients = await viem.getWalletClients();

    const owner = walletClients[0];
    const doctor1 = walletClients[1];
    const patient1 = walletClients[2];
    const hrdUser = walletClients[3]; // Bertindak sebagai pihak ketiga/verifikator

    // 1. Deploy DoctorRegistry
    const doctorRegistry = await viem.deployContract("DoctorRegistry");

    // 2. Deploy PatientRegistry
    const patientRegistry = await viem.deployContract("PatientRegistry");

    // 3. Deploy MedicalDocumentNFT (Menginjeksikan alamat kedua registry di atas)
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
      doctor1,
      patient1,
      hrdUser,
    };
  }

  // Helper Tambahan: Menyediakan lingkungan di mana dokter & pasien sudah terdaftar sah
  async function setupRegisteredUsers() {
    const ctx = await deployContracts();

    // Registrasi Pasien
    const txPat = await ctx.patientRegistry.write.registerPatient({
      account: ctx.patient1.account,
    });
    await ctx.publicClient.waitForTransactionReceipt({ hash: txPat });

    // Registrasi Dokter & Verifikasi oleh Admin/Owner
    const txDocReg = await ctx.doctorRegistry.write.registerDoctor({
      account: ctx.doctor1.account,
    });
    await ctx.publicClient.waitForTransactionReceipt({ hash: txDocReg });

    const txDocVer = await ctx.doctorRegistry.write.verifyDoctor(
      [ctx.doctor1.account.address],
      { account: ctx.owner.account },
    );
    await ctx.publicClient.waitForTransactionReceipt({ hash: txDocVer });

    return ctx;
  }

  // ==================================================================
  // SKENARIO UJI 1: MANAJEMEN REGISTRASI & EVENT
  // ==================================================================
  it("1. Harus sukses mendaftarkan pasien dan memancarkan Event PatientRegistered", async () => {
    const { patientRegistry, patient1, publicClient } = await deployContracts();

    const tx = await patientRegistry.write.registerPatient({
      account: patient1.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: tx });

    // Cek State di Smart Contract
    const isRegistered = await patientRegistry.read.isRegisteredPatient([
      patient1.account.address,
    ]);
    assert.equal(isRegistered, true, "Pasien gagal terdaftar di blockchain");

    // Uji Emisi Event
    const events = await patientRegistry.getEvents.PatientRegistered();
    assert.equal(events.length, 1, "Event PatientRegistered tidak memancar");
    assert.equal(
      events[0].args.patientAddress?.toLowerCase(),
      patient1.account.address.toLowerCase(),
    );
  });

  it("2. Harus sukses mendaftarkan dokter, memverifikasi, dan memancarkan Event DoctorVerified", async () => {
    const { doctorRegistry, owner, doctor1, publicClient } =
      await deployContracts();

    // Dokter mendaftar sendiri
    await doctorRegistry.write.registerDoctor({ account: doctor1.account });

    // Owner memverifikasi dokter tersebut
    const txVerify = await doctorRegistry.write.verifyDoctor(
      [doctor1.account.address],
      { account: owner.account },
    );
    await publicClient.waitForTransactionReceipt({ hash: txVerify });

    // Verifikasi State
    const isVerified = await doctorRegistry.read.isVerifiedDoctor([
      doctor1.account.address,
    ]);
    assert.equal(isVerified, true, "Dokter gagal terverifikasi oleh owner");

    // Uji Emisi Event Verifikasi
    const verifiedEvents = await doctorRegistry.getEvents.DoctorVerified();
    assert.equal(verifiedEvents.length, 1);
    assert.equal(
      verifiedEvents[0].args.doctorAddress?.toLowerCase(),
      doctor1.account.address.toLowerCase(),
    );
  });

  // ==================================================================
  // SKENARIO UJI 2: PENERBITAN DOKUMEN & SOULBOUND TOKEN (SBT)
  // ==================================================================
  it("3. Gagal menerbitkan dokumen jika akun dokter belum lolos verifikasi admin", async () => {
    const { medicalDocumentNFT, doctor1, patient1 } = await deployContracts();

    // Mencoba menerbitkan tanpa registrasi/verifikasi dokter terlebih dahulu
    await assert.rejects(
      async () => {
        await medicalDocumentNFT.write.issueDocument(
          ["0xDocHash", "ipfs://uri-metadata", patient1.account.address, 0n],
          { account: doctor1.account },
        );
      },
      /Doctor is not verified/,
      "Sistem meloloskan dokter yang tidak terverifikasi",
    );
  });

  it("4. Dokter terverifikasi dapat menerbitkan NFT dokumen medis dan datanya tersinkronisasi", async () => {
    const { medicalDocumentNFT, doctor1, patient1, publicClient } =
      await setupRegisteredUsers();

    const ipfsHash = "0xKriptografiPDFHash999";
    const metaUri = "https://metadata.web3/record/0";
    const expiryDate = BigInt(Math.floor(Date.now() / 1000) + 31536000); // Kedaluwarsa +1 Tahun

    const txMint = await medicalDocumentNFT.write.issueDocument(
      [ipfsHash, metaUri, patient1.account.address, expiryDate],
      { account: doctor1.account },
    );
    await publicClient.waitForTransactionReceipt({ hash: txMint });

    // Pastikan kepemilikan NFT (Token ID: 0) jatuh ke tangan Pasien
    const nftOwner = await medicalDocumentNFT.read.ownerOf([0n]);
    assert.equal(
      nftOwner.toLowerCase(),
      patient1.account.address.toLowerCase(),
    );

    // Periksa validitas data di dalam Struct internal NFT
    const docStruct = await medicalDocumentNFT.read.medicalDocuments([0n]);
    assert.equal(docStruct[0], ipfsHash); // documentHash
    assert.equal(
      docStruct[1].toLowerCase(),
      doctor1.account.address.toLowerCase(),
    ); // issuer
    assert.equal(docStruct[5], true, "Dokumen seharusnya berstatus Valid"); // isValid
  });

  it("5. Proteksi Soulbound: NFT tidak boleh dipindahtangankan oleh pasien ke dompet lain", async () => {
    const { medicalDocumentNFT, doctor1, patient1, hrdUser, publicClient } =
      await setupRegisteredUsers();

    // Menerbitkan dokumen terlebih dahulu
    await medicalDocumentNFT.write.issueDocument(
      ["0xHash", "URI", patient1.account.address, 0n],
      { account: doctor1.account },
    );

    // Skenario pembajakan / transfer dokumen medis ke pihak lain (Harus di-block oleh Hook _update)
    await assert.rejects(
      async () => {
        await medicalDocumentNFT.write.transferFrom(
          [patient1.account.address, hrdUser.account.address, 0n],
          { account: patient1.account },
        );
      },
      /Medical documents are Soulbound and cannot be transferred/,
      "Dokumen lolos dari pembatasan Soulbound Token",
    );
  });

  // ==================================================================
  // SKENARIO UJI 3: JEJAK AUDIT & PEMBATALAN (REVOKE)
  // ==================================================================
  it("6. Skenario verifikasi oleh Pihak Ketiga harus terekam di dalam Jejak Audit Publik Blockchain", async () => {
    const { medicalDocumentNFT, doctor1, patient1, hrdUser, publicClient } =
      await setupRegisteredUsers();

    await medicalDocumentNFT.write.issueDocument(
      ["0xHash", "URI", patient1.account.address, 0n],
      { account: doctor1.account },
    );

    // Instansi Pihak Ketiga (HRD Perusahaan) melakukan klik 'Verifikasi Dokumen'
    const txCheck = await medicalDocumentNFT.write.verifyDocumentByNFT([0n], {
      account: hrdUser.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: txCheck });

    // Tarik riwayat forensik publik dari Blockchain
    const auditLogs = await medicalDocumentNFT.read.getVerificationHistory([
      0n,
    ]);

    assert.equal(
      auditLogs.length,
      1,
      "Gagal menaruh log di antrean audit trail",
    );
    assert.equal(
      auditLogs[0].verifier.toLowerCase(),
      hrdUser.account.address.toLowerCase(),
    );
    assert.equal(
      auditLogs[0].verificationResult,
      true,
      "Hasil pengecekan dokumen harusnya bernilai asli/true",
    );
  });

  it("7. Dokter penerbit dapat membatalkan dokumen (Revoke), mematikan fungsionalitas validasinya", async () => {
    const { medicalDocumentNFT, doctor1, patient1, hrdUser, publicClient } =
      await setupRegisteredUsers();

    await medicalDocumentNFT.write.issueDocument(
      ["0xHash", "URI", patient1.account.address, 0n],
      { account: doctor1.account },
    );

    // Dokter mengeksekusi penarikan dokumen resmi
    const txRevoke = await medicalDocumentNFT.write.revokeDocument([0n], {
      account: doctor1.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: txRevoke });

    // Cek status internal struct
    const currentStatus = await medicalDocumentNFT.read.medicalDocuments([0n]);
    assert.equal(
      currentStatus[5],
      false,
      "Status isValid gagal beralih ke false",
    );

    // Jika di kemudian hari ada entitas mencoba mengecek rekam medis ini, blockchain akan melabeli tidak valid
    await medicalDocumentNFT.write.verifyDocumentByNFT([0n], {
      account: hrdUser.account,
    });
    const finalAuditTrail =
      await medicalDocumentNFT.read.getVerificationHistory([0n]);

    // Indeks ke-1 karena audit ke-0 kosong, audit ke-1 (setelah revoke) harus bernilai false
    assert.equal(
      finalAuditTrail[0].verificationResult,
      false,
      "Jejak audit meloloskan NFT medis yang telah dibatalkan",
    );
  });

  
});
