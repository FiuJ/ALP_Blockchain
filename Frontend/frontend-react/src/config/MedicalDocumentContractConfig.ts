export const MEDICAL_NFT_ADDRESS =
  "0x789... (Alamat deploy MedicalDocumentNFT)";

export const medicalNftABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_doctorRegistryAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_patientRegistryAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "doctorRegistry",
    outputs: [
      {
        internalType: "contract IDoctorRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getVerificationHistory",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "verifier",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "verifiedAt",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "verificationResult",
            type: "bool",
          },
        ],
        internalType: "struct MedicalDocumentNFT.VerificationRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "documentHash",
        type: "string",
      },
      {
        internalType: "string",
        name: "documentType",
        type: "string",
      },
      {
        internalType: "string",
        name: "tokenURI",
        type: "string",
      },
      {
        internalType: "address",
        name: "patientAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "expiredAt",
        type: "uint256",
      },
    ],
    name: "issueDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "medicalDocuments",
    outputs: [
      {
        internalType: "string",
        name: "documentHash",
        type: "string",
      },
      {
        internalType: "string",
        name: "documentType",
        type: "string",
      },
      {
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        internalType: "address",
        name: "patient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "issuedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiredAt",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isValid",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "patientRegistry",
    outputs: [
      {
        internalType: "contract IPatientRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "revokeDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "verifyDocumentByNFT",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
