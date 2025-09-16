'use client';

import { getVerticalById, getVerticalRecommendations, getMarginRiskLevel } from '@/lib/business-verticals';

interface VerticalInsightsProps {
  verticalId: string;
  showApplyButton?: boolean;
}

export default function VerticalInsights({
  verticalId,
  showApplyButton = false
}: VerticalInsightsProps) {
  const vertical = getVerticalById(verticalId);
  const recommendations = getVerticalRecommendations(verticalId);

  if (!vertical || !recommendations) {
    return null;
  }

  const riskLevel = getMarginRiskLevel(vertical.typicalMargins.average);
  const riskColors = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-red-600 bg-red-50 border-red-200'
  };


  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{vertical.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-primary-900 mb-1">
            {vertical.name} Insights
          </h4>
          <p className="text-sm text-primary-700">
            Business insights and risk factors for your industry
          </p>
        </div>
      </div>

      {/* Margin Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 border border-primary-200">
          <div className="text-xs text-gray-600 mb-1">Typical Margins</div>
          <div className="font-bold text-lg text-gray-900">
            {vertical.typicalMargins.min}% - {vertical.typicalMargins.max}%
          </div>
          <div className="text-xs text-gray-500">
            Avg: {vertical.typicalMargins.average}%
          </div>
        </div>

        <div className={`rounded-lg p-3 border ${riskColors[riskLevel]}`}>
          <div className="text-xs mb-1">Risk Level</div>
          <div className="font-bold text-lg capitalize">
            {riskLevel}
          </div>
          <div className="text-xs">
            Based on margins
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border border-primary-200">
          <div className="text-xs text-gray-600 mb-1">Loan Type</div>
          <div className="font-bold text-sm text-gray-900">
            Zero Interest
          </div>
          <div className="text-xs text-gray-500">
            Microloan
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-white rounded-lg p-3 border border-primary-200">
        <h5 className="font-medium text-gray-900 mb-2 text-sm">Key Risk Factors</h5>
        <div className="flex flex-wrap gap-2">
          {vertical.riskFactors.map((factor, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 border border-orange-200"
            >
              ⚠️ {factor}
            </span>
          ))}
        </div>
      </div>


      {/* Industry Note */}
      <div className="text-xs text-primary-600 bg-white rounded p-2 border border-primary-200">
        🌐 <strong>Industry Insight:</strong> {vertical.name.toLowerCase()} businesses build credibility through community connections and proven business performance.
        Your network strength + business metrics help lenders assess your loan request.
      </div>
    </div>
  );
}

export function CompactVerticalInsights({ verticalId }: { verticalId: string }) {
  const vertical = getVerticalById(verticalId);

  if (!vertical) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
      <span>{vertical.icon}</span>
      <span>Avg margins: {vertical.typicalMargins.average}%</span>
      <span>•</span>
      <span>Zero-interest microloan</span>
    </div>
  );
}