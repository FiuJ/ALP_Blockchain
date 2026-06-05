// ==========================================
// 1. DOCTOR REGISTRY CONTRACT
// ==========================================
export const DOCTOR_REGISTRY_ADDRESS =
  "0x123... (Alamat deploy DoctorRegistry)";

export const doctorRegistryABI = [
  [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "doctorAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "doctorName",
          type: "string",
        },
      ],
      name: "DoctorRegistered",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "doctorAddress",
          type: "address",
        },
      ],
      name: "DoctorRevoked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "doctorAddress",
          type: "address",
        },
      ],
      name: "DoctorVerified",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "doctors",
      outputs: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "doctorLicenseNumber",
          type: "string",
        },
        {
          internalType: "string",
          name: "specialization",
          type: "string",
        },
        {
          internalType: "string",
          name: "clinicName",
          type: "string",
        },
        {
          internalType: "string",
          name: "clinicLocation",
          type: "string",
        },
        {
          internalType: "bool",
          name: "isVerified",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "isRegistered",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "doctorAddress",
          type: "address",
        },
      ],
      name: "isVerifiedDoctor",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
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
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "doctorLicenseNumber",
          type: "string",
        },
        {
          internalType: "string",
          name: "specialization",
          type: "string",
        },
        {
          internalType: "string",
          name: "clinicName",
          type: "string",
        },
        {
          internalType: "string",
          name: "clinicLocation",
          type: "string",
        },
      ],
      name: "registerDoctor",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "doctorAddress",
          type: "address",
        },
      ],
      name: "revokeDoctor",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "doctorAddress",
          type: "address",
        },
      ],
      name: "verifyDoctor",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
] as const;

