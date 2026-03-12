import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#f3f7eb',
    categories: ['education', 'productivity'],
    description: 'CymruCards helps you build Welsh vocabulary with flashcards, spaced review, and lightweight progress tracking.',
    display: 'standalone',
    icons: [
      {
        purpose: 'any',
        sizes: '192x192',
        src: '/pwa-icons/192',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '192x192',
        src: '/pwa-icons/192?purpose=maskable',
        type: 'image/png',
      },
      {
        purpose: 'any',
        sizes: '512x512',
        src: '/pwa-icons/512',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '512x512',
        src: '/pwa-icons/512?purpose=maskable',
        type: 'image/png',
      },
    ],
    lang: 'en-GB',
    name: 'CymruCards',
    orientation: 'portrait',
    short_name: 'CymruCards',
    start_url: '/flashcards',
    theme_color: '#2C5439',
  };
}
