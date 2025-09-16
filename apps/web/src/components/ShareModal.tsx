'use client';

import { useState, useEffect } from 'react';
import { 
    XMarkIcon, 
    ClipboardDocumentIcon,
    ClipboardDocumentCheckIcon 
} from '@heroicons/react/24/outline';
import { generateShareUrls, copyToClipboard, trackShareEvent, type CampaignShareData } from '@/utils/shareUtils';

const socialPlatforms = [
    { 
        id: 'facebook',
        name: 'Facebook', 
        brandColor: 'bg-[#1877F2] hover:bg-[#1565C0]', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
        )
    },
    { 
        id: 'whatsapp',
        name: 'WhatsApp', 
        brandColor: 'bg-[#25D366] hover:bg-[#1EBD5B]', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
            </svg>
        )
    },
    { 
        id: 'twitter',
        name: 'X', 
        brandColor: 'bg-black hover:bg-gray-800', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
        )
    },
    { 
        id: 'linkedin',
        name: 'LinkedIn', 
        brandColor: 'bg-[#0A66C2] hover:bg-[#004182]', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        )
    },
    { 
        id: 'email',
        name: 'Email', 
        brandColor: 'bg-gray-600 hover:bg-gray-700', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
            </svg>
        )
    },
    { 
        id: 'telegram',
        name: 'Telegram', 
        brandColor: 'bg-[#0088CC] hover:bg-[#006699]', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
        )
    },
    { 
        id: 'reddit',
        name: 'Reddit', 
        brandColor: 'bg-[#FF4500] hover:bg-[#E03D00]', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
        )
    },
    { 
        id: 'discord',
        name: 'Discord', 
        brandColor: 'bg-[#5865F2] hover:bg-[#4752C4]', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189z"/>
            </svg>
        )
    },
    { 
        id: 'bluesky',
        name: 'Bluesky', 
        brandColor: 'bg-[#1DA1F2] hover:bg-[#1A91DA]', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.06-.138.017-.277.036-.415.056-2.67-.297-5.568.628-6.383 3.364C.378 17.85 0 22.81 0 23.5c0 .688.139 1.86.902 2.203.659.299 1.664.621 4.3-1.24 2.752-1.942 5.711-5.881 6.798-7.995C13.087 18.582 16.046 22.521 18.798 24.463c2.636 1.861 3.641 1.539 4.3 1.24.763-.343.902-1.515.902-2.203 0-.69-.378-5.65-.624-6.479-.815-2.736-3.713-3.661-6.383-3.364-.138-.02-.277-.039-.415-.056.138.017.277.036.415.056 2.67.297 5.568-.628 6.383-3.364C23.622 9.42 24 4.46 24 3.772c0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.751 13.087 8.69 12 10.804z"/>
            </svg>
        )
    },
    { 
        id: 'farcaster',
        name: 'Farcaster', 
        brandColor: 'bg-[#855DCD] hover:bg-[#7A56C2]', 
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 1000 1000" fill="currentColor">
                <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z"/>
                <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
                <path d="M675.555 746.667C663.282 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.555V817.778C875.555 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.555Z"/>
            </svg>
        )
    },
    { 
        id: 'tiktok',
        name: 'TikTok', 
        brandColor: 'bg-[#000000] hover:bg-gray-800', 
        icon: (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
        )
    },
    { 
        id: 'snapchat',
        name: 'Snapchat', 
        brandColor: 'bg-[#FFFC00] hover:bg-[#E6E300] text-black', 
        icon: (
            <svg className="w-5 h-5" viewBox="147.353 39.286 514.631 514.631" fill="currentColor">
                <path d="M407.001,473.488c-1.068,0-2.087-0.039-2.862-0.076c-0.615,0.053-1.25,0.076-1.886,0.076 c-22.437,0-37.439-10.607-50.678-19.973c-9.489-6.703-18.438-13.031-28.922-14.775c-5.149-0.854-10.271-1.287-15.22-1.287 c-8.917,0-15.964,1.383-21.109,2.389c-3.166,0.617-5.896,1.148-8.006,1.148c-2.21,0-4.895-0.49-6.014-4.311 c-0.887-3.014-1.523-5.934-2.137-8.746c-1.536-7.027-2.65-11.316-5.281-11.723c-28.141-4.342-44.768-10.738-48.08-18.484 c-0.347-0.814-0.541-1.633-0.584-2.443c-0.129-2.309,1.501-4.334,3.777-4.711c22.348-3.68,42.219-15.492,59.064-35.119 c13.049-15.195,19.457-29.713,20.145-31.316c0.03-0.072,0.065-0.148,0.101-0.217c3.247-6.588,3.893-12.281,1.926-16.916 c-3.626-8.551-15.635-12.361-23.58-14.882c-1.976-0.625-3.845-1.217-5.334-1.808c-7.043-2.782-18.626-8.66-17.083-16.773 c1.124-5.916,8.949-10.036,15.273-10.036c1.756,0,3.312,0.308,4.622,0.923c7.146,3.348,13.575,5.045,19.104,5.045 c6.876,0,10.197-2.618,11-3.362c-0.198-3.668-0.44-7.546-0.674-11.214c0-0.004-0.005-0.048-0.005-0.048 c-1.614-25.675-3.627-57.627,4.546-75.95c24.462-54.847,76.339-59.112,91.651-59.112c0.408,0,6.674-0.062,6.674-0.062 c0.283-0.005,0.59-0.009,0.908-0.009c15.354,0,67.339,4.27,91.816,59.15c8.173,18.335,6.158,50.314,4.539,76.016l-0.076,1.23 c-0.222,3.49-0.427,6.793-0.6,9.995c0.756,0.696,3.795,3.096,9.978,3.339c5.271-0.202,11.328-1.891,17.998-5.014 c2.062-0.968,4.345-1.169,5.895-1.169c2.343,0,4.727,0.456,6.714,1.285l0.106,0.041c5.66,2.009,9.367,6.024,9.447,10.242 c0.071,3.932-2.851,9.809-17.223,15.485c-1.472,0.583-3.35,1.179-5.334,1.808c-7.952,2.524-19.951,6.332-23.577,14.878 c-1.97,4.635-1.322,10.326,1.926,16.912c0.036,0.072,0.067,0.145,0.102,0.221c1,2.344,25.205,57.535,79.209,66.432 c2.275,0.379,3.908,2.406,3.778,4.711c-0.048,0.828-0.248,1.656-0.598,2.465c-3.289,7.703-19.915,14.09-48.064,18.438 c-2.642,0.408-3.755,4.678-5.277,11.668c-0.63,2.887-1.271,5.717-2.146,8.691c-0.819,2.797-2.641,4.164-5.567,4.164h-0.441 c-1.905,0-4.604-0.346-8.008-1.012c-5.95-1.158-12.623-2.236-21.109-2.236c-4.948,0-10.069,0.434-15.224,1.287 c-10.473,1.744-19.421,8.062-28.893,14.758C444.443,462.88,429.436,473.488,407.001,473.488"/>
            </svg>
        )
    },
];

type ShareModalProps = {
    isOpen: boolean;
    onClose: () => void;
    campaign: CampaignShareData;
    customMessage?: string;
};

export default function ShareModal({ isOpen, onClose, campaign, customMessage }: ShareModalProps) {
    const [campaignUrl, setCampaignUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCampaignUrl(`${window.location.origin}/campaign/${campaign.id}`);
        }
    }, [campaign.id]);

    const handleCopyToClipboard = async () => {
        const success = await copyToClipboard(campaignUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            trackShareEvent(campaign.id, 'copy_link', 'share');
        }
    };

    const handlePlatformShare = async (platformId: string) => {
        const shareUrls = generateShareUrls(campaign, customMessage);
        const shareUrl = shareUrls[platformId];

        if (platformId === 'discord') {
            const success = await copyToClipboard(`${customMessage || `Check out ${campaign.businessName} on Jama!`} ${campaignUrl}`);
            if (success) {
                setCopiedPlatform(platformId);
                setTimeout(() => setCopiedPlatform(null), 2000);
            }
        } else if (platformId === 'email') {
            window.location.href = shareUrl;
        } else {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
        
        trackShareEvent(campaign.id, platformId, 'share');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl p-6 m-4 w-full max-w-md relative animate-in slide-in-from-bottom-10 fade-in-25">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
                
                <h2 className="text-xl font-bold mb-4 text-gray-900">Share Campaign</h2>
                
                {/* Campaign Preview */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-1">{campaign.businessName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{campaign.title}</p>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium text-primary-600">{Math.round(campaign.progressPercentage)}% funded</span>
                    </div>
                </div>

                {/* URL Copy Section */}
                <div className="flex items-center space-x-2 mb-6">
                    <input 
                        type="text" 
                        readOnly 
                        value={campaignUrl} 
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button 
                        onClick={handleCopyToClipboard}
                        className="flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold transition-colors"
                    >
                        {copied ? (
                            <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500" />
                        ) : (
                            <ClipboardDocumentIcon className="w-5 h-5" />
                        )}
                        <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>

                <h3 className="text-lg font-bold mb-2 text-gray-900">Share on social media</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Help spread the word and bring more supporters to this campaign
                </p>

                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {socialPlatforms.map(platform => (
                        <button 
                            key={platform.id}
                            onClick={() => handlePlatformShare(platform.id)}
                            className={`flex items-center p-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-md ${platform.brandColor} ${platform.name === 'Snapchat' ? 'text-black' : 'text-white'}`}
                        >
                            <div className="flex-shrink-0">
                                {platform.icon}
                            </div>
                            <span className="ml-3 font-semibold">
                                {platform.id === 'discord' && copiedPlatform === 'discord' ? 'Copied!' : platform.name}
                            </span>
                        </button>
                    ))}
                </div>
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                    Share tracking helps improve campaign reach
                </div>
            </div>
        </div>
    );
}