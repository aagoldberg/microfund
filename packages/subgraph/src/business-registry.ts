import { BusinessRegistered, BusinessVerified, BusinessMetadataUpdated, BusinessMetricsUpdated } from '../generated/BusinessRegistry/BusinessRegistry'
import { Business } from '../generated/schema'
import { Bytes } from '@graphprotocol/graph-ts'

export function handleBusinessRegistered(event: BusinessRegistered): void {
  let business = new Business(event.params.business.toHex())
  business.address = event.params.business
  business.name = event.params.name
  business.metadataURI = event.params.metadataURI
  business.owner = event.params.business
  business.verified = false
  business.totalRaised = event.params.timestamp
  business.totalRepaid = event.params.timestamp
  business.onTimePayments = event.params.timestamp
  business.latePayments = event.params.timestamp
  business.defaultedAmount = event.params.timestamp
  business.campaignCount = event.params.timestamp
  business.successfulCampaigns = event.params.timestamp
  business.activeInvestors = event.params.timestamp
  business.registeredAt = event.params.timestamp
  business.lastActivityAt = event.params.timestamp
  business.save()
}

export function handleBusinessVerified(event: BusinessVerified): void {
  let business = Business.load(event.params.business.toHex())
  if (business) {
    business.verified = true
    business.lastActivityAt = event.params.timestamp
    business.save()
  }
}

export function handleBusinessMetadataUpdated(event: BusinessMetadataUpdated): void {
  let business = Business.load(event.params.business.toHex())
  if (business) {
    business.metadataURI = event.params.newURI
    business.lastActivityAt = event.params.timestamp
    business.save()
  }
}

export function handleBusinessMetricsUpdated(event: BusinessMetricsUpdated): void {
  let business = Business.load(event.params.business.toHex())
  if (business) {
    business.totalRaised = event.params.totalRaised
    business.totalRepaid = event.params.totalRepaid
    business.lastActivityAt = event.params.timestamp
    business.save()
  }
}