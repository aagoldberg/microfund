'use client';

import CreateCampaignForm from '@/components/CreateCampaignForm';

export default function CreateCampaignPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Microloan Campaign
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access zero-interest microloans to grow your business.
            Repay only the principal amount - no interest or equity required.
          </p>
        </div>
        <CreateCampaignForm />
      </div>
    </div>
  );
}