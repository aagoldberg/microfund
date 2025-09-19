// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MicroLoan.sol";
import "./BusinessRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MicroLoanFactory is Ownable {
    error InvalidDuration();
    error InvalidGracePeriod();
    error InvalidLoanAmount();
    error BusinessNotRegistered();
    error EmptyMetadataURI();

    struct BusinessParams {
        string name;
        string metadataURI;
    }

    BusinessRegistry public immutable businessRegistry;
    address public immutable token;

    uint256 public constant MIN_LOAN_AMOUNT = 100 * 10**6; // 100 USDC
    uint256 public constant MAX_LOAN_AMOUNT = 10000 * 10**6; // 10,000 USDC
    uint256 public constant MIN_FUNDING_DURATION = 1 days;
    uint256 public constant MAX_FUNDING_DURATION = 30 days;
    uint256 public constant MIN_REPAYMENT_DURATION = 30 days;
    uint256 public constant MAX_REPAYMENT_DURATION = 365 days;
    uint256 public constant MIN_GRACE_PERIOD = 7 days;
    uint256 public constant MAX_GRACE_PERIOD = 30 days;

    MicroLoan[] public loans;
    mapping(address => MicroLoan[]) public borrowerLoans;

    event LoanCreated(
        address indexed loan,
        address indexed borrower,
        uint256 loanAmount,
        uint256 fundingDeadline,
        uint256 repaymentDuration,
        uint256 gracePeriod
    );

    constructor(address _businessRegistry, address _token) Ownable(msg.sender) {
        businessRegistry = BusinessRegistry(_businessRegistry);
        token = _token;
    }

    function createLoan(
        string memory metadataURI,
        uint256 loanAmount,
        uint256 fundingDuration,
        uint256 repaymentDuration,
        uint256 gracePeriod,
        BusinessParams memory businessParams
    ) external returns (address) {
        // Auto-register business if not already registered
        if (!businessRegistry.isRegistered(msg.sender)) {
            // Require business parameters for new businesses
            if (bytes(businessParams.name).length == 0) revert EmptyMetadataURI();
            if (bytes(businessParams.metadataURI).length == 0) revert EmptyMetadataURI();

            businessRegistry.registerBusinessFor(
                msg.sender,
                businessParams.name,
                businessParams.metadataURI
            );
        }
        if (bytes(metadataURI).length == 0) revert EmptyMetadataURI();
        if (loanAmount < MIN_LOAN_AMOUNT || loanAmount > MAX_LOAN_AMOUNT) {
            revert InvalidLoanAmount();
        }
        if (fundingDuration < MIN_FUNDING_DURATION || fundingDuration > MAX_FUNDING_DURATION) {
            revert InvalidDuration();
        }
        if (repaymentDuration < MIN_REPAYMENT_DURATION || repaymentDuration > MAX_REPAYMENT_DURATION) {
            revert InvalidDuration();
        }
        if (gracePeriod < MIN_GRACE_PERIOD || gracePeriod > MAX_GRACE_PERIOD) {
            revert InvalidGracePeriod();
        }

        uint256 fundingDeadline = block.timestamp + fundingDuration;

        MicroLoan loan = new MicroLoan(
            msg.sender,
            token,
            address(businessRegistry),
            metadataURI,
            loanAmount,
            fundingDeadline,
            repaymentDuration,
            gracePeriod
        );

        loans.push(loan);
        borrowerLoans[msg.sender].push(loan);

        emit LoanCreated(
            address(loan),
            msg.sender,
            loanAmount,
            fundingDeadline,
            repaymentDuration,
            gracePeriod
        );

        return address(loan);
    }

    function getLoanCount() external view returns (uint256) {
        return loans.length;
    }

    function getBorrowerLoanCount(address borrower) external view returns (uint256) {
        return borrowerLoans[borrower].length;
    }

    function getAllLoans() external view returns (MicroLoan[] memory) {
        return loans;
    }

    function getBorrowerLoans(address borrower) external view returns (MicroLoan[] memory) {
        return borrowerLoans[borrower];
    }

    function getActiveLoans() external view returns (MicroLoan[] memory) {
        uint256 activeCount = 0;

        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].fundingActive() || !loans[i].loanFullyRepaid()) {
                activeCount++;
            }
        }

        MicroLoan[] memory activeLoans = new MicroLoan[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].fundingActive() || !loans[i].loanFullyRepaid()) {
                activeLoans[index++] = loans[i];
            }
        }

        return activeLoans;
    }

}