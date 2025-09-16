'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { campaignAbi } from '@/abi/campaign';

interface LendingPaymentOptionsProps {
  loanAddress: string;
  usdcAmount: number;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export default function LendingPaymentOptions({
  loanAddress,
  usdcAmount,
  onSuccess,
  onError
}: LendingPaymentOptionsProps) {
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash
  });

  const handleContribute = async () => {
    if (!isConnected || !address) {
      onError?.('Please connect your wallet');
      return;
    }

    try {
      setIsProcessing(true);

      const amount = parseUnits(usdcAmount.toString(), 6); // USDC has 6 decimals

      await writeContract({
        address: loanAddress as `0x${string}`,
        abi: campaignAbi,
        functionName: 'contribute',
        args: [amount],
      });

      if (isSuccess) {
        onSuccess?.(`Successfully contributed $${usdcAmount} USDC to the loan!`);
      }
    } catch (err) {
      console.error('Contribution error:', err);
      onError?.('Failed to process contribution');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-sm text-yellow-800">Please connect your wallet to lend to this loan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-900">Lending Details</h4>
          <span className="text-sm text-gray-500">Zero Interest</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Loan Amount:</span>
            <span className="font-medium">${usdcAmount.toLocaleString()} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Interest Rate:</span>
            <span className="font-medium text-green-600">0%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Expected Return:</span>
            <span className="font-medium">${usdcAmount.toLocaleString()} USDC</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleContribute}
        disabled={isProcessing || isPending || isConfirming}
        className="w-full btn-primary-lg"
      >
        {isProcessing || isPending ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : isConfirming ? (
          'Confirming...'
        ) : (
          `Lend $${usdcAmount.toLocaleString()} USDC`
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            Error: {error.message || 'Transaction failed'}
          </p>
        </div>
      )}
    </div>
  );
}