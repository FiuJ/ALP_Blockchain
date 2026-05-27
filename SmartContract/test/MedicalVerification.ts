import "@nomicfoundation/hardhat-toolbox-viem"; // Ini akan menyuntikkan tipe .viem ke NetworkConnection
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("MedicalDocumentVerification", async function () {
  // Mengambil instance viem secara dinamis menggunakan network
  const { viem } = await network.create();

  async function deployContracts() {
    const publicClient = await viem.getPublicClient();
    const walletClients = await viem.getWalletClients();

    const owner = walletClients[0];
    const doctor1 = walletClients[1];
    const patient1 = walletClients[2];

    // Deploy Contract utama
    const contract = await viem.deployContract("MedicalDocumentVerification");

    return { contract, publicClient, owner, doctor1, patient1 };
  }

  it("test_should_return_owner_address", async function () {
    const { contract, owner } = await deployContracts();

    const contractOwner = await contract.read.owner();

    assert.equal(
      contractOwner.toLowerCase(),
      owner.account.address.toLowerCase(),
      "Owner address does not match deployer address",
    );
  });

  it("test_should_register_new_doctor", async function () {
    const { contract, doctor1 } = await deployContracts();

    // Dokter mendaftar
    await contract.write.registerDoctor(
      ["Dr. Budi", "SIP-12345", "Umum", "Klinik Sehat", "Surabaya"],
      { account: doctor1.account },
    );

    const doctorData = await contract.read.getDoctorDetails([
      doctor1.account.address,
    ]);

    assert.equal(doctorData[0], "Dr. Budi", "Nama dokter salah");
    assert.equal(doctorData[6], true, "Status isRegistered harusnya true");
    assert.equal(doctorData[5], false, "Status isVerified harusnya false");
  });

  it("test_should_allow_owner_to_verify_doctor", async function () {
    const { contract, owner, doctor1 } = await deployContracts();

    // Dokter mendaftar
    await contract.write.registerDoctor(
      ["Dr. Budi", "SIP-12345", "Umum", "Klinik", "SBY"],
      { account: doctor1.account },
    );

    // Admin (owner) memverifikasi dokter
    await contract.write.verifyDoctor([doctor1.account.address], {
      account: owner.account,
    });

    const isVerified = await contract.read.isVerifiedDoctor([
      doctor1.account.address,
    ]);
    assert.equal(isVerified, true, "Dokter gagal diverifikasi oleh admin");
  });

  it("test_should_allow_doctor_to_issue_document_if_verified", async function () {
    const { contract, owner, doctor1, patient1 } = await deployContracts();

    // Setup awal
    await contract.write.registerDoctor(
      ["Dr. Budi", "SIP", "Umum", "Klinik", "SBY"],
      { account: doctor1.account },
    );
    await contract.write.verifyDoctor([doctor1.account.address], {
      account: owner.account,
    });
    await contract.write.registerPatient(["Andi", "RM-001"], {
      account: patient1.account,
    });

    const docHash = "0xABC123";
    const expiredAt = BigInt(Math.floor(Date.now() / 1000) + 86400); // 1 hari ke depan

    // Dokter menerbitkan surat
    await contract.write.issueDocument(
      [
        docHash,
        "/file_letters/doc1.pdf",
        "Surat Sakit",
        "Istirahat 3 hari",
        patient1.account.address,
        expiredAt,
      ],
      { account: doctor1.account },
    );

    // Verifikasi bahwa dokumen berhasil disimpan
    const docDetails = await contract.read.getDocumentDetails([docHash]);
    assert.equal(
      docDetails[7],
      true,
      "Dokumen harusnya berstatus valid (isValid = true)",
    );
    assert.equal(docDetails[0], docHash, "Hash dokumen tidak sesuai");
  });

  it("test_should_not_allow_unverified_doctor_to_issue_document", async function () {
    const { contract, doctor1, patient1 } = await deployContracts();

    // Dokter daftar tapi TIDAK diverifikasi admin
    await contract.write.registerDoctor(
      ["Dr. Budi", "SIP", "Umum", "Klinik", "SBY"],
      { account: doctor1.account },
    );
    await contract.write.registerPatient(["Andi", "RM-001"], {
      account: patient1.account,
    });

    const docHash = "0xABC123";
    const expiredAt = BigInt(Math.floor(Date.now() / 1000) + 86400);

    // Tes ini harus ditolak karena revert "Doctor is not verified"
    await assert.rejects(
      async () => {
        await contract.write.issueDocument(
          [
            docHash,
            "/path",
            "Tipe",
            "Deskripsi",
            patient1.account.address,
            expiredAt,
          ],
          { account: doctor1.account },
        );
      },
      (err: Error) => {
        assert.match(err.message, /Doctor is not verified/);
        return true;
      },
      "Expected transaction to be rejected with 'Doctor is not verified'",
    );
  });
});
