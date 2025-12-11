export type LocationPayload = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  source: 'browser';
};

export type PointOfInterest = {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  distance: number;
  category?: string;
};
