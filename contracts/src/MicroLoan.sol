// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BusinessRegistry.sol";

contract MicroLoan is ReentrancyGuard {
    using SafeERC20 for IERC20;

    error NotOwner();
    error CampaignHasEnded();
    error CampaignNotActive();
    error InvalidAmount();
    error FundingGoalExceeded();
    error InsufficientFunding();
    error RepaymentTooEarly();
    error LoanFullyRepaid();
    error TransferFailed();
    error PermitDeadlineExpired();
    error MetadataUpdateRestricted();
    error EmptyMetadataURI();
    error UpdateCooldownActive();
    error RepaymentExceedsOutstanding();

    address public immutable borrower;
    IERC20 public immutable token;
    BusinessRegistry public immutable businessRegistry;
    string public metadataURI;
    uint256 public lastMetadataUpdate;
    uint256 public constant METADATA_UPDATE_COOLDOWN = 1 hours;

    uint256 public immutable loanAmount;
    uint256 public immutable fundingDeadline;
    uint256 public totalFunded;
    bool public fundingActive = true;

    uint256 public immutable repaymentDuration;
    uint256 public immutable gracePeriod;
    uint256 public loanDisbursedAt;
    uint256 public totalRepaid;
    bool public loanDisbursed;
    bool public loanFullyRepaid;

    mapping(address => uint256) public contributions;
    address[] public contributors;

    event Contributed(address indexed contributor, uint256 amount);
    event FundingGoalReached(uint256 totalAmount);
    event LoanDisbursed(uint256 amount);
    event RepaymentMade(uint256 amount, uint256 totalRepaid);
    event LoanRepaid(uint256 totalAmount);
    event CampaignRefunded(address indexed contributor, uint256 amount);
    event MetadataUpdated(string newURI);

    modifier onlyBorrower() {
        if (msg.sender != borrower) revert NotOwner();
        _;
    }

    constructor(
        address _borrower,
        address _token,
        address _businessRegistry,
        string memory _metadataURI,
        uint256 _loanAmount,
        uint256 _fundingDeadline,
        uint256 _repaymentDuration,
        uint256 _gracePeriod
    ) {
        borrower = _borrower;
        token = IERC20(_token);
        businessRegistry = BusinessRegistry(_businessRegistry);
        metadataURI = _metadataURI;
        loanAmount = _loanAmount;
        fundingDeadline = _fundingDeadline;
        repaymentDuration = _repaymentDuration;
        gracePeriod = _gracePeriod;
    }

    function contribute(uint256 amount) external nonReentrant {
        if (!fundingActive) revert CampaignNotActive();
        if (block.timestamp >= fundingDeadline) revert CampaignHasEnded();
        if (amount == 0) revert InvalidAmount();
        if (totalFunded + amount > loanAmount) revert FundingGoalExceeded();

        token.safeTransferFrom(msg.sender, address(this), amount);

        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }

        contributions[msg.sender] += amount;
        totalFunded += amount;

        emit Contributed(msg.sender, amount);

        if (totalFunded == loanAmount) {
            fundingActive = false;
            emit FundingGoalReached(totalFunded);
        }
    }

    function contributeWithPermit(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant {
        if (deadline < block.timestamp) revert PermitDeadlineExpired();

        IERC20Permit(address(token)).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        if (!fundingActive) revert CampaignNotActive();
        if (block.timestamp >= fundingDeadline) revert CampaignHasEnded();
        if (amount == 0) revert InvalidAmount();
        if (totalFunded + amount > loanAmount) revert FundingGoalExceeded();

        token.safeTransferFrom(msg.sender, address(this), amount);

        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }

        contributions[msg.sender] += amount;
        totalFunded += amount;

        emit Contributed(msg.sender, amount);

        if (totalFunded == loanAmount) {
            fundingActive = false;
            emit FundingGoalReached(totalFunded);
        }
    }

    function disburseLoan() external onlyBorrower nonReentrant {
        if (fundingActive) revert CampaignNotActive();
        if (totalFunded < loanAmount) revert InsufficientFunding();
        if (loanDisbursed) revert TransferFailed();

        loanDisbursed = true;
        loanDisbursedAt = block.timestamp;

        token.safeTransfer(borrower, totalFunded);

        emit LoanDisbursed(totalFunded);
    }

    function makeRepayment(uint256 amount) external onlyBorrower nonReentrant {
        if (!loanDisbursed) revert CampaignNotActive();
        if (loanFullyRepaid) revert LoanFullyRepaid();
        if (amount == 0) revert InvalidAmount();

        uint256 outstanding = loanAmount - totalRepaid;
        if (amount > outstanding) revert RepaymentExceedsOutstanding();

        token.safeTransferFrom(msg.sender, address(this), amount);

        totalRepaid += amount;

        emit RepaymentMade(amount, totalRepaid);

        if (totalRepaid == loanAmount) {
            loanFullyRepaid = true;
            emit LoanRepaid(totalRepaid);
            _distributeRepayment();
        }
    }

    function _distributeRepayment() private {
        uint256 balance = token.balanceOf(address(this));

        for (uint256 i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint256 share = (contributions[contributor] * balance) / loanAmount;

            if (share > 0) {
                token.safeTransfer(contributor, share);
            }
        }
    }

    function refund() external nonReentrant {
        if (block.timestamp < fundingDeadline) revert CampaignNotActive();
        if (totalFunded >= loanAmount) revert CampaignNotActive();
        if (loanDisbursed) revert CampaignNotActive();

        uint256 contribution = contributions[msg.sender];
        if (contribution == 0) revert InvalidAmount();

        contributions[msg.sender] = 0;
        token.safeTransfer(msg.sender, contribution);

        emit CampaignRefunded(msg.sender, contribution);
    }

    function updateMetadata(string memory newURI) external onlyBorrower {
        if (bytes(newURI).length == 0) revert EmptyMetadataURI();
        if (block.timestamp < lastMetadataUpdate + METADATA_UPDATE_COOLDOWN) {
            revert UpdateCooldownActive();
        }

        metadataURI = newURI;
        lastMetadataUpdate = block.timestamp;

        emit MetadataUpdated(newURI);
    }

    function getContributors() external view returns (address[] memory) {
        return contributors;
    }

    function getContributorCount() external view returns (uint256) {
        return contributors.length;
    }

    function getRemainingFundingTime() external view returns (uint256) {
        if (block.timestamp >= fundingDeadline) return 0;
        return fundingDeadline - block.timestamp;
    }

    function getRepaymentDeadline() external view returns (uint256) {
        if (!loanDisbursed) return 0;
        return loanDisbursedAt + gracePeriod + repaymentDuration;
    }

    function getOutstandingAmount() external view returns (uint256) {
        if (!loanDisbursed) return loanAmount;
        if (loanFullyRepaid) return 0;
        return loanAmount - totalRepaid;
    }
}