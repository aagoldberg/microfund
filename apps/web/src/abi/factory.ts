export const factoryAbi = [
  {
    inputs: [
      { internalType: "address", name: "_businessRegistry", type: "address" },
      { internalType: "address", name: "_token", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "InvalidDuration",
    type: "error"
  },
  {
    inputs: [],
    name: "InvalidGracePeriod",
    type: "error"
  },
  {
    inputs: [],
    name: "InvalidLoanAmount",
    type: "error"
  },
  {
    inputs: [],
    name: "BusinessNotRegistered",
    type: "error"
  },
  {
    inputs: [],
    name: "EmptyMetadataURI",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "loan", type: "address" },
      { indexed: true, internalType: "address", name: "borrower", type: "address" },
      { indexed: false, internalType: "uint256", name: "loanAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "fundingDeadline", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "repaymentDuration", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "gracePeriod", type: "uint256" }
    ],
    name: "LoanCreated",
    type: "event"
  },
  {
    inputs: [
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "uint256", name: "loanAmount", type: "uint256" },
      { internalType: "uint256", name: "fundingDuration", type: "uint256" },
      { internalType: "uint256", name: "repaymentDuration", type: "uint256" },
      { internalType: "uint256", name: "gracePeriod", type: "uint256" }
    ],
    name: "createLoan",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getLoanCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "borrower", type: "address" }],
    name: "getBorrowerLoanCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getAllLoans",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "borrower", type: "address" }],
    name: "getBorrowerLoans",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getActiveLoans",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "businessRegistry",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;