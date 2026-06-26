import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Outturn by AgriNexus';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logoData = await readFile(
    join(process.cwd(), 'public', 'agrinexus-mark.png'),
    'base64'
  );
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #0B1F17 0%, #157347 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 30 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={96} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 46, fontWeight: 700 }}>Outturn</div>
            <div style={{ fontSize: 20, opacity: 0.72, marginTop: 2 }}>by AgriNexus</div>
          </div>
        </div>
        <div style={{ fontSize: 30, opacity: 0.92, maxWidth: 860, lineHeight: 1.35 }}>
          Proof of what your advisory program produced. Powered by AgriNexus AI.
        </div>
        <div style={{ fontSize: 18, marginTop: 34, opacity: 0.72 }}>
          Vercel + Amazon DynamoDB · H0 Hackathon
        </div>
      </div>
    ),
    { ...size }
  );
}
