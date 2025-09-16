import {
  Contributed,
  FundingGoalReached,
  LoanDisbursed,
  RepaymentMade,
  LoanRepaid,
  CampaignRefunded,
  ReturnsWithdrawn,
  MetadataUpdated
} from '../generated/templates/MicroLoan/MicroLoan'
import { Loan, Contribution, Repayment, Lender, GlobalStats } from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleContributed(event: Contributed): void {
  // Update or create lender first
  let lenderId = event.params.contributor.toHex()
  let lender = Lender.load(lenderId)
  if (!lender) {
    lender = new Lender(lenderId)
    lender.address = event.params.contributor
    lender.totalContributed = BigInt.fromI32(0)
    lender.totalReturned = BigInt.fromI32(0)
    lender.totalWithdrawn = BigInt.fromI32(0)
    lender.activeLoans = BigInt.fromI32(0)

    // Update global stats for new lender
    let stats = GlobalStats.load('global')
    if (stats) {
      stats.totalLenders = stats.totalLenders.plus(BigInt.fromI32(1))
      stats.save()
    }
  }
  lender.totalContributed = lender.totalContributed.plus(event.params.amount)
  lender.activeLoans = lender.activeLoans.plus(BigInt.fromI32(1))
  lender.save()

  // Create contribution entity
  let contributionId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let contribution = new Contribution(contributionId)
  contribution.loan = event.address.toHex()
  contribution.contributor = lenderId
  contribution.amount = event.params.amount
  contribution.timestamp = event.block.timestamp
  contribution.transactionHash = event.transaction.hash
  contribution.save()

  // Update loan
  let loan = Loan.load(event.address.toHex())
  if (loan) {
    loan.totalFunded = loan.totalFunded.plus(event.params.amount)
    loan.save()
  }

  // Update global stats
  let stats = GlobalStats.load('global')
  if (stats) {
    stats.totalAmountLent = stats.totalAmountLent.plus(event.params.amount)
    stats.save()
  }
}

export function handleFundingGoalReached(event: FundingGoalReached): void {
  let loan = Loan.load(event.address.toHex())
  if (loan) {
    loan.fundingActive = false
    loan.save()

    // Update global stats
    let stats = GlobalStats.load('global')
    if (stats) {
      stats.totalLoansFunded = stats.totalLoansFunded.plus(BigInt.fromI32(1))
      stats.save()
    }
  }
}

export function handleLoanDisbursed(event: LoanDisbursed): void {
  let loan = Loan.load(event.address.toHex())
  if (loan) {
    loan.loanDisbursed = true
    loan.disbursedAt = event.block.timestamp
    loan.save()
  }
}

export function handleRepaymentMade(event: RepaymentMade): void {
  // Create repayment entity
  let repaymentId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let repayment = new Repayment(repaymentId)
  repayment.loan = event.address.toHex()
  repayment.amount = event.params.amount
  repayment.totalRepaidAfter = event.params.totalRepaid
  repayment.timestamp = event.block.timestamp
  repayment.transactionHash = event.transaction.hash
  repayment.save()

  // Update loan
  let loan = Loan.load(event.address.toHex())
  if (loan) {
    loan.totalRepaid = event.params.totalRepaid
    loan.save()
  }

  // Update global stats
  let stats = GlobalStats.load('global')
  if (stats) {
    stats.totalAmountRepaid = stats.totalAmountRepaid.plus(event.params.amount)
    stats.save()
  }
}

export function handleLoanRepaid(event: LoanRepaid): void {
  let loan = Loan.load(event.address.toHex())
  if (loan) {
    loan.loanFullyRepaid = true
    loan.save()

    // Update global stats
    let stats = GlobalStats.load('global')
    if (stats) {
      stats.totalLoansRepaid = stats.totalLoansRepaid.plus(BigInt.fromI32(1))
      stats.save()
    }
  }
}

export function handleCampaignRefunded(event: CampaignRefunded): void {
  // Update lender stats for refund
  let lenderId = event.params.contributor.toHex()
  let lender = Lender.load(lenderId)
  if (lender) {
    lender.totalReturned = lender.totalReturned.plus(event.params.amount)
    lender.activeLoans = lender.activeLoans.minus(BigInt.fromI32(1))
    lender.save()
  }
}

export function handleReturnsWithdrawn(event: ReturnsWithdrawn): void {
  let loan = Loan.load(event.address.toHex())
  if (loan) {
    // Update loan statistics
    loan.totalWithdrawn = loan.totalWithdrawn.plus(event.params.amount)
    loan.save()

    // Update lender statistics
    let lenderId = event.address.toHex() + "-" + event.params.contributor.toHex()
    let lender = Lender.load(lenderId)
    if (lender) {
      lender.totalWithdrawn = lender.totalWithdrawn.plus(event.params.amount)
      lender.save()
    }
  }
}

export function handleMetadataUpdated(event: MetadataUpdated): void {
  let loan = Loan.load(event.address.toHex())
  if (loan) {
    loan.metadataURI = event.params.newURI
    loan.save()
  }
}