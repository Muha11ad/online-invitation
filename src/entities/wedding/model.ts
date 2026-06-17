export interface Wedding {
  id: string;
  names: { a: string; b: string };
  date: {
    short: string;
    full: string;
    formatted: string;
    ddmmyyyy: string;
  };
  location: {
    city: string;
    ceremonyTime: string;
    venue: string;
    address: string;
    coords?: { lat: number; lon: number; zoom?: number };
  };
  message: string;
  heroImage: string;
  gallery: string[];
  slug: string;
}
