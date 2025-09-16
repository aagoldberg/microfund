import { LoanCreated } from '../generated/MicroLoanFactory/MicroLoanFactory'
import { MicroLoan } from '../generated/templates'
import { Loan, Business, GlobalStats } from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleLoanCreated(event: LoanCreated): void {
  // Create new loan entity
  let loan = new Loan(event.params.loan.toHex())
  loan.address = event.params.loan

  // Link to borrower
  let borrowerId = event.params.borrower.toHex()
  let borrower = Business.load(borrowerId)
  if (!borrower) {
    // Create business if not exists (shouldn't happen if registry is used properly)
    borrower = new Business(borrowerId)
    borrower.address = event.params.borrower
    borrower.name = ''
    borrower.metadataURI = ''
    borrower.owner = event.params.borrower
    borrower.verified = false
    borrower.totalRaised = BigInt.fromI32(0)
    borrower.totalRepaid = BigInt.fromI32(0)
    borrower.onTimePayments = BigInt.fromI32(0)
    borrower.latePayments = BigInt.fromI32(0)
    borrower.defaultedAmount = BigInt.fromI32(0)
    borrower.campaignCount = BigInt.fromI32(0)
    borrower.successfulCampaigns = BigInt.fromI32(0)
    borrower.activeInvestors = BigInt.fromI32(0)
    borrower.registeredAt = event.block.timestamp
    borrower.lastActivityAt = event.block.timestamp
    borrower.save()
  }

  loan.borrower = borrowerId
  loan.metadataURI = ''
  loan.loanAmount = event.params.loanAmount
  loan.fundingDeadline = event.params.fundingDeadline
  loan.repaymentDuration = event.params.repaymentDuration
  loan.gracePeriod = event.params.gracePeriod
  loan.totalFunded = BigInt.fromI32(0)
  loan.totalRepaid = BigInt.fromI32(0)
  loan.fundingActive = true
  loan.loanDisbursed = false
  loan.loanFullyRepaid = false
  loan.createdAt = event.block.timestamp
  loan.save()

  // Start indexing this loan contract
  MicroLoan.create(event.params.loan)

  // Update global stats
  let stats = GlobalStats.load('global')
  if (!stats) {
    stats = new GlobalStats('global')
    stats.totalLoansCreated = BigInt.fromI32(0)
    stats.totalLoansFunded = BigInt.fromI32(0)
    stats.totalLoansRepaid = BigInt.fromI32(0)
    stats.totalAmountLent = BigInt.fromI32(0)
    stats.totalAmountRepaid = BigInt.fromI32(0)
    stats.totalBusinesses = BigInt.fromI32(0)
    stats.totalLenders = BigInt.fromI32(0)
  }
  stats.totalLoansCreated = stats.totalLoansCreated.plus(BigInt.fromI32(1))
  stats.save()
}