import { ObjectId } from "mongodb";

export interface RawWeddingDoc {
  _id: ObjectId;
  names: {
    a: string;
    b: string;
  };
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
    coords: {
      lat: number;
      lon: number;
    };
  };
  message: string;
  music?: string;
  slug: string;
  template?: "first" | "second";
}
