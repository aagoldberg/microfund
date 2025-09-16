'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

const GET_ALL_CAMPAIGNS = gql`
  query GetAllCampaigns {
    loans(orderBy: createdAt, orderDirection: desc) {
      id
      address
      loanAmount
      totalFunded
      fundingDeadline
      fundingActive
      loanDisbursed
      loanFullyRepaid
      totalRepaid
      metadataURI
      createdAt
      borrower {
        id
        name
        address
        verified
      }
    }
  }
`;

interface CampaignMetadata {
  title: string;
  description: string;
  image?: string;
  businessName?: string;
  website?: string;
  creditScore?: {
    score: number;
    riskLevel: string;
  };
}

interface Campaign {
  address: `0x${string}`;
  id?: string;
  loanAmount: string;
  totalFunded: string;
  fundingDeadline: string;
  fundingActive: boolean;
  loanDisbursed: boolean;
  loanFullyRepaid: boolean;
  totalRepaid: string;
  backerCount?: number;
  createdAt?: string;
  borrower?: {
    id: string;
    name?: string;
    address: string;
    verified: boolean;
  };
  metadata: CampaignMetadata | null;
}

async function getIPFSMetadata(cid: string): Promise<CampaignMetadata | null> {
  if (!cid) return null;
  
  // Multiple IPFS gateways to try in order
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://w3s.link/ipfs/'
  ];
  
  const cleanCid = cid.replace('ipfs://', '');
  
  // Add timeout for each request
  const fetchWithTimeout = async (url: string, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };
  
  for (const gateway of gateways) {
    try {
      const url = `${gateway}${cleanCid}`;
      
      const response = await fetchWithTimeout(url, 5000);
      
      if (response.ok) {
        const metadata = await response.json();
        return metadata;
      }
    } catch (error) {
      // Silently continue to next gateway
      continue;
    }
  }
  
  // Return fallback metadata instead of null
  console.warn(`IPFS metadata unavailable for CID: ${cleanCid}, using fallback`);
  return {
    title: 'Campaign Data Loading...',
    description: 'Campaign metadata is temporarily unavailable. Please check back later.',
    businessName: 'Business',
    image: ''
  };
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { data, loading, error, refetch } = useQuery(GET_ALL_CAMPAIGNS, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all', // Continue even if there's an error
  });

  useEffect(() => {
    if (data?.loans) {
      processCampaigns();
    }
  }, [data, error]);

  const processCampaigns = async () => {
    if (!data?.loans) return;

    try {
      const campaignPromises = data.loans.map(async (loan: any) => {
        let metadata: CampaignMetadata | null = null;

        // Always provide fallback metadata
        if (loan.metadataURI) {
          metadata = await getIPFSMetadata(loan.metadataURI);
        }

        // If no metadata, create a basic one
        if (!metadata) {
          metadata = {
            title: `Loan ${loan.id.slice(0, 6)}...${loan.id.slice(-4)}`,
            description: 'Loan details are being loaded...',
            businessName: loan.borrower?.name || `Business ${loan.borrower?.address.slice(0, 6)}...${loan.borrower?.address.slice(-4)}`,
            image: ''
          };
        }

        return {
          address: loan.address as `0x${string}`,
          id: loan.id,
          loanAmount: loan.loanAmount?.toString() || '0',
          totalFunded: loan.totalFunded?.toString() || '0',
          fundingDeadline: loan.fundingDeadline?.toString() || '0',
          fundingActive: loan.fundingActive ?? true,
          loanDisbursed: loan.loanDisbursed ?? false,
          loanFullyRepaid: loan.loanFullyRepaid ?? false,
          totalRepaid: loan.totalRepaid?.toString() || '0',
          backerCount: 0, // TODO: Calculate from contributions
          createdAt: loan.createdAt,
          borrower: loan.borrower,
          metadata,
        };
      });

      const results = await Promise.all(campaignPromises);
      setCampaigns(results);
    } catch (e) {
      console.error('Failed to process loans:', e);
      setCampaigns([]);
    }
  };


  return {
    campaigns,
    loading,
    error: error ? error.message : null,
    refetch
  };
}