import { useState } from 'react';
import { MapPin, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { LocationPayload } from '../types';

interface LocationDetectorProps {
  onLocationDetected: (location: LocationPayload) => void;
}

export function LocationDetector({ onLocationDetected }: LocationDetectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const payload: LocationPayload = {
          latitude,
          longitude,
          accuracy: accuracy || undefined,
          timestamp: position.timestamp,
          source: 'browser',
        };

        onLocationDetected(payload);
        setIsLoading(false);
      },
      (geoError) => {
        const isDenied = geoError.code === geoError.PERMISSION_DENIED;
        setError(
          isDenied
            ? 'Location access was denied. Please allow location sharing to continue.'
            : 'Unable to retrieve your location. Please try again.'
        );
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 1000,
      }
    );
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={detectLocation}
        disabled={isLoading}
        className="bg-gray-900 text-white hover:bg-gray-800 px-12 py-8 rounded-sm transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Finding your location...
          </>
        ) : (
          <>
            <MapPin className="mr-3 h-6 w-6" />
            Share my location
          </>
        )}
      </Button>
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}