import { notFound } from 'next/navigation';
import type { Wedding } from '@/entities/wedding';
import { EventTemplate1Page } from '@/page-components/event-template-1';
import clientPromise from '@/shared/lib/mongodb';

interface RawWeddingDoc {
  _id: { toString(): string };
  names?: { a?: string; b?: string };
  date?: {
    short?: string;
    full?: string;
    formatted?: string;
    ddmmyyyy?: string;
  };
  location?: {
    city?: string;
    ceremonyTime?: string;
    venue?: string;
    address?: string;
    coords?: { lat?: unknown; lon?: unknown; zoom?: unknown };
  };
  message?: string;
  heroImage?: string;
  gallery?: unknown[];
  slug?: string;
}

function sanitizeHttpsUrl(raw: string | undefined): string {
  if (!raw) return '';
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return '';
  }
  if (parsed.protocol !== 'https:') return '';
  return raw;
}

function toWedding(doc: RawWeddingDoc): Wedding {
  return {
    id: doc._id.toString(),
    names: {
      a: doc.names?.a ?? '',
      b: doc.names?.b ?? '',
    },
    date: {
      short: doc.date?.short ?? '',
      full: doc.date?.full ?? '',
      formatted: doc.date?.formatted ?? '',
      ddmmyyyy: doc.date?.ddmmyyyy ?? '',
    },
    location: {
      city: doc.location?.city ?? '',
      ceremonyTime: doc.location?.ceremonyTime ?? '',
      venue: doc.location?.venue ?? '',
      address: doc.location?.address ?? '',
      coords: (() => {
        const c = doc.location?.coords;
        const lat = Number.isFinite(c?.lat as number) ? (c!.lat as number) : undefined;
        const lon = Number.isFinite(c?.lon as number) ? (c!.lon as number) : undefined;
        if (lat === undefined || lon === undefined) return undefined;
        const zoom = Number.isFinite(c?.zoom as number) ? (c!.zoom as number) : undefined;
        return { lat, lon, ...(zoom !== undefined && { zoom }) };
      })(),
    },
    message: doc.message ?? '',
    heroImage: sanitizeHttpsUrl(doc.heroImage),
    gallery: Array.isArray(doc.gallery)
      ? doc.gallery
          .filter((g): g is string => typeof g === 'string')
          .map((url) => sanitizeHttpsUrl(url))
          .filter((url): url is string => url !== '')
      : [],
    slug: doc.slug ?? '',
  };
}

export default async function EventSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const client = await clientPromise;
  const db = client.db('online-invitations');
  const doc = await db
    .collection<RawWeddingDoc>('weddings')
    .findOne({ slug });

  if (!doc) {
    notFound();
  }

  const wedding = toWedding(doc);

  return <EventTemplate1Page wedding={wedding} />;
}
