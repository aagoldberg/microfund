'use client';

import React, { useState } from 'react';
import { useEnhancedCampaigns, type EnhancedCampaign } from '@/hooks/useEnhancedCampaigns';
import { formatUnits } from 'viem';
import Link from 'next/link';
import { CompactHealthScore } from './HealthScoreIndicator';
import ShareModal from './ShareModal';
import type { CampaignShareData } from '@/utils/shareUtils';
import { ProgressiveBar } from './ProgressiveBar';

const USDC_DECIMALS = 6;

export default function FundingRequestList() {
  const { campaigns, loading, error } = useEnhancedCampaigns();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <FundingRequestCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Error loading campaigns: {error}</p>;
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Ready to leverage your network and prove your business performance.</p>
        <Link 
          href="/create-campaign" 
          className="btn-primary text-sm"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <FundingRequestCard key={campaign.address} campaign={campaign} />
      ))}
    </div>
  );
}

function FundingRequestCard({ campaign }: { campaign: EnhancedCampaign }) {
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  
  const formattedTotal = formatUnits(BigInt(campaign.totalFunded || '0'), USDC_DECIMALS);
  const formattedGoal = formatUnits(BigInt(campaign.loanAmount || '0'), USDC_DECIMALS);
  const progressPercentage = campaign.loanAmount && Number(campaign.loanAmount) > 0
    ? (Number(campaign.totalFunded || '0') / Number(campaign.loanAmount)) * 100
    : 0;

  // Calculate time remaining
  const daysRemaining = campaign.deadline ? Math.max(0, Math.floor((Number(campaign.deadline) - Date.now() / 1000) / 86400)) : 0;
  const isActive = campaign.fundingActive;
  const isFullyFunded = progressPercentage >= 100;


  return (
    <Link 
      href={`/campaign/${campaign.address}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 relative"
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {isFullyFunded ? (
          <div className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Funded
          </div>
        ) : !isActive ? (
          <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Ended
          </div>
        ) : daysRemaining <= 3 && daysRemaining > 0 ? (
          <div className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {daysRemaining} days left
          </div>
        ) : null}
      </div>

      {campaign.metadata?.image ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={campaign.metadata.image.startsWith('ipfs://') 
              ? `https://ipfs.io/ipfs/${campaign.metadata.image.replace('ipfs://', '')}`
              : campaign.metadata.image
            } 
            alt={campaign.metadata?.title || 'Business'}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to alternative IPFS gateways if the primary fails
              const target = e.target as HTMLImageElement;
              const originalSrc = target.src;
              
              if (originalSrc.includes('ipfs.io')) {
                target.src = originalSrc.replace('https://ipfs.io/ipfs/', 'https://dweb.link/ipfs/');
              } else if (originalSrc.includes('dweb.link')) {
                target.src = originalSrc.replace('https://dweb.link/ipfs/', 'https://cloudflare-ipfs.com/ipfs/');
              } else if (originalSrc.includes('cloudflare-ipfs.com')) {
                target.src = originalSrc.replace('https://cloudflare-ipfs.com/ipfs/', 'https://gateway.pinata.cloud/ipfs/');
              } else {
                // If all IPFS gateways fail, show fallback placeholder
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="h-48 w-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                      <div class="text-white text-center">
                        <div class="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <p class="text-sm font-medium">Image unavailable</p>
                      </div>
                    </div>
                  `;
                }
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm font-medium">{campaign.metadata?.businessName || 'Business'}</p>
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1">
            {campaign.metadata?.businessName ? (
              campaign.metadata.businessName
            ) : (
              <span className="text-gray-400 italic">Business name loading...</span>
            )}
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {campaign.metadata?.title ? (
            campaign.metadata.title
          ) : campaign.metadata?.description ? (
            campaign.metadata.description
          ) : (
            <span className="text-gray-400 italic">Campaign details loading...</span>
          )}
        </p>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-900">
              ${parseFloat(formattedTotal).toLocaleString()} raised
            </span>
            <span className="text-xs text-gray-500">
              {progressPercentage.toFixed(1)}% of ${parseFloat(formattedGoal).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                isFullyFunded ? 'bg-green-500' : progressPercentage > 75 ? 'bg-orange-500' : 'bg-primary-600'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>


        {/* Quick Action */}
        <div className="flex gap-2">
          {isActive && !isFullyFunded ? (
            <>
              <div className="flex-1 bg-primary-600 text-white text-center py-2 rounded-lg text-sm font-medium group-hover:bg-primary-700 transition-colors">
                Fund Now
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShareModalOpen(true);
                }}
                className="w-8 h-8 bg-white border-2 border-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-50 transition-colors"
                title="Share campaign"
              >
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </>
          ) : isFullyFunded ? (
            <>
              <div className="flex-1 bg-green-100 text-green-700 text-center py-2 rounded-lg text-sm font-medium">
                Fully Funded
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShareModalOpen(true);
                }}
                className="w-8 h-8 bg-white border-2 border-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-50 transition-colors"
                title="Share campaign"
              >
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 bg-gray-100 text-gray-500 text-center py-2 rounded-lg text-sm font-medium">
                Campaign Ended
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Share functionality
                  const shareData = {
                    title: campaign.metadata?.title || 'Support this campaign',
                    text: `Check out ${campaign.metadata?.businessName || 'this business'} on Yunus`,
                    url: `${window.location.origin}/campaign/${campaign.address}`
                  };
                  if (navigator.share && navigator.canShare(shareData)) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(shareData.url);
                    // Could add toast notification here
                  }
                }}
                className="w-8 h-8 bg-white border-2 border-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-50 transition-colors"
                title="Share campaign"
              >
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </>
          )}
          <div className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 group-hover:border-gray-300 transition-colors">
            View Details
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        campaign={{
          id: campaign.address,
          title: campaign.metadata?.title || 'Funding Campaign',
          businessName: campaign.metadata?.businessName || 'Business',
          description: campaign.metadata?.description,
          image: campaign.metadata?.image,
          goal: Number(formattedGoal),
          raised: Number(formattedTotal),
          progressPercentage,
          daysLeft: daysRemaining
        } as CampaignShareData}
      />
    </Link>
  );
}

function FundingRequestCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
        <div className="h-2 bg-gray-200 rounded-full mb-2" />
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}