'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { useEnhancedLoans } from './useEnhancedCampaigns';
import { TOKEN_CONFIG } from '@/lib/constants';
import { campaignAbi } from '@/abi/campaign';

export interface LenderLoan {
  loanAddress: `0x${string}`;
  loanTitle: string;
  businessName: string;
  contribution: bigint;
  pendingRepayment: bigint;
  totalReceived: bigint;
  principalAmount: bigint;
  status: 'funding' | 'active' | 'completed';
  image?: string;
  description?: string;
}

export interface LenderSummary {
  totalLent: bigint;
  totalPending: bigint;
  totalReceived: bigint;
  totalValue: bigint;
  activeLoans: number;
  completedLoans: number;
}

export function useInvestorData() {
  const { address, isConnected } = useAccount();
  const { loans } = useEnhancedLoans();
  const [loansList, setLoansList] = useState<LenderLoan[]>([]);
  const [summary, setSummary] = useState<LenderSummary>({
    totalLent: 0n,
    totalPending: 0n,
    totalReceived: 0n,
    totalValue: 0n,
    activeLoans: 0,
    completedLoans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create contract calls for all loans
  const contractCalls = loans.flatMap(loan => [
    {
      address: loan.address as `0x${string}`,
      abi: campaignAbi,
      functionName: 'contributions',
      args: [address],
    },
    {
      address: loan.address as `0x${string}`,
      abi: campaignAbi,
      functionName: 'pendingReturns',
      args: [address],
    },
    {
      address: loan.address as `0x${string}`,
      abi: campaignAbi,
      functionName: 'getCampaignDetails',
    },
  ]);

  // Read all contract data at once
  const { data: contractResults, isLoading: contractsLoading, error: contractsError } = useReadContracts({
    contracts: contractCalls,
    query: {
      enabled: !!address && !!isConnected && loans.length > 0,
    },
  });

  // Process contract results
  useEffect(() => {
    if (!address || !isConnected || !loans.length) {
      setLoading(false);
      setLoansList([]);
      setSummary({
        totalLent: 0n,
        totalPending: 0n,
        totalReceived: 0n,
        totalValue: 0n,
        activeLoans: 0,
        completedLoans: 0,
      });
      return;
    }

    if (contractsLoading) {
      setLoading(true);
      return;
    }

    if (contractsError) {
      setError('Failed to fetch lending data from contracts');
      setLoading(false);
      return;
    }

    if (contractResults) {
      processContractData();
    }
  }, [address, isConnected, loans, contractResults, contractsLoading, contractsError]);

  const processContractData = () => {
    if (!contractResults) return;

    setLoading(true);
    setError(null);

    try {
      const userLoans: LenderLoan[] = [];

      // Process results for each loan (3 calls per loan)
      for (let i = 0; i < loans.length; i++) {
        const loan = loans[i];
        const contributionResult = contractResults[i * 3];
        const pendingReturnsResult = contractResults[i * 3 + 1];
        const loanDetailsResult = contractResults[i * 3 + 2];

        // Only include loans where user has contributed
        const contribution = contributionResult.result as bigint;
        if (contribution && contribution > 0n) {
          const pendingRepayment = (pendingReturnsResult.result as bigint) || 0n;
          const loanDetails = loanDetailsResult.result as any[];

          // Extract loan details
          const fundingActive = loanDetails ? loanDetails[5] as boolean : false;
          const repaymentActive = loanDetails ? loanDetails[6] as boolean : false;

          // For zero-interest loans, principal amount equals contribution
          const principalAmount = contribution;

          // Determine status based on loan state
          let status: 'funding' | 'active' | 'completed' = 'funding';
          if (!fundingActive && repaymentActive) {
            status = 'active';
          } else if (!fundingActive && !repaymentActive) {
            status = 'completed';
          }

          // For now, we'll assume totalReceived is 0 since we don't track historical withdrawals yet
          // In a full implementation, you'd track this via events or additional contract state
          const totalReceived = 0n;

          userLoans.push({
            loanAddress: loan.address as `0x${string}`,
            loanTitle: loan.metadata?.title || 'Untitled Loan',
            businessName: loan.metadata?.businessName || 'Unknown Business',
            contribution,
            pendingRepayment,
            totalReceived,
            principalAmount,
            status,
            image: loan.metadata?.image,
            description: loan.metadata?.description,
          });
        }
      }

      setLoansList(userLoans);

      // Calculate summary
      const totalLent = userLoans.reduce((sum, loan) => sum + loan.contribution, 0n);
      const totalPending = userLoans.reduce((sum, loan) => sum + loan.pendingRepayment, 0n);
      const totalReceived = userLoans.reduce((sum, loan) => sum + loan.totalReceived, 0n);
      const totalValue = totalReceived + totalPending;
      const activeLoans = userLoans.filter(loan => loan.status === 'active').length;
      const completedLoans = userLoans.filter(loan => loan.status === 'completed').length;

      setSummary({
        totalLent,
        totalPending,
        totalReceived,
        totalValue,
        activeLoans,
        completedLoans,
      });

    } catch (err) {
      console.error('Error processing contract data:', err);
      setError('Failed to process lending data');
    } finally {
      setLoading(false);
    }
  };

  // Format currency values for display
  const formatCurrency = (value: bigint) => {
    return `$${parseFloat(formatUnits(value, TOKEN_CONFIG.USDC.decimals)).toLocaleString()}`;
  };

  // Get loans by status
  const getInvestmentsByStatus = (status: 'funding' | 'active' | 'completed') => {
    return loansList.filter(loan => loan.status === status);
  };

  // Refresh data manually
  const refetch = () => {
    if (address && isConnected && loans.length && contractResults) {
      processContractData();
    }
  };

  return {
    loans: loansList,
    summary,
    loading,
    error,
    formatCurrency,
    getInvestmentsByStatus,
    refetch,
    isConnected: isConnected && !!address,
  };
}