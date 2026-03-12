import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const ALLOWED_SIZES = new Set([192, 512]);

function getNumericSize(value: string) {
  const parsed = Number.parseInt(value, 10);
  return ALLOWED_SIZES.has(parsed) ? parsed : null;
}

export async function GET(request: Request, { params }: { params: { size: string } }) {
  const size = getNumericSize(params.size);

  if (!size) {
    return new Response('Unsupported icon size', { status: 400 });
  }

  const url = new URL(request.url);
  const isMaskable = url.searchParams.get('purpose') === 'maskable';
  const safeZone = isMaskable ? '18%' : '24%';
  const fontSize = size === 512 ? 176 : 66;
  const subtitleSize = size === 512 ? 40 : 16;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(180deg, #2C5439 0%, #40664a 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: safeZone,
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
            border: '2px solid rgba(255,255,255,0.35)',
            borderRadius: '24%',
            display: 'flex',
            height: '100%',
            inset: safeZone,
            position: 'absolute',
            width: '100%',
          }}
        />
        <div
          style={{
            alignItems: 'center',
            background: 'linear-gradient(180deg, rgba(246,250,236,0.96) 0%, rgba(224,237,206,0.96) 100%)',
            borderRadius: '28%',
            boxShadow: '0 24px 60px rgba(8, 20, 13, 0.28)',
            color: '#2C5439',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: size === 512 ? '64px 48px' : '24px 18px',
          }}
        >
          <div
            style={{
              fontSize,
              fontWeight: 800,
              letterSpacing: '-0.06em',
              lineHeight: 1,
            }}
          >
            CC
          </div>
          <div
            style={{
              fontSize: subtitleSize,
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginTop: size === 512 ? 8 : 4,
              textTransform: 'uppercase',
            }}
          >
            CymruCards
          </div>
        </div>
      </div>
    ),
    {
      height: size,
      width: size,
    },
  );
}
