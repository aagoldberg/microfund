import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('API: Received upload request');

    // Check if API keys are configured
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
      console.error('API: Missing Pinata API keys');
      return NextResponse.json(
        { error: 'Pinata API keys not configured' },
        { status: 500 }
      );
    }

    const metadata = await request.json();
    console.log('API: Metadata to upload:', JSON.stringify(metadata, null, 2));

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': process.env.PINATA_API_KEY!,
        'pinata_secret_api_key': process.env.PINATA_SECRET_KEY!,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `Campaign Metadata - ${metadata.title || 'Untitled'}`,
          keyvalues: {
            type: 'campaign-metadata',
            timestamp: new Date().toISOString(),
          },
        },
      }),
    });

    console.log('API: Pinata response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Pinata error response:', errorText);
      throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API: Pinata success result:', result);
    return NextResponse.json({ hash: result.IpfsHash });
  } catch (error) {
    console.error('API: Error uploading metadata to IPFS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to upload metadata to IPFS: ${errorMessage}` },
      { status: 500 }
    );
  }
}