import { useEffect, useRef, useState } from 'react';
import { LocationDetector } from './components/LocationDetector';
import { PlacesList } from './components/PlacesList';
import { Logo } from './components/Logo';
import { PodcastPlayer } from './components/PodcastPlayer';
import { streamMockPodcastFromLocation } from './lib/api';
import { PointOfInterest, LocationPayload } from './types';
import { mockPlacesData } from './utils/mockData';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [location, setLocation] = useState<LocationPayload | null>(null);
  const [places, setPlaces] = useState<PointOfInterest[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const previousAudioUrlRef = useRef<string | null>(null);
  const statusCopy: Record<string, string> = {
    connecting: 'Connecting to n8n agent…',
    'receiving-events': 'Receiving points of interest…',
    'streaming-audio': 'Streaming ElevenLabs audio…',
    'fallback-local': 'Using a local fallback clip',
  };

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      if (previousAudioUrlRef.current && previousAudioUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previousAudioUrlRef.current);
      }
    };
  }, []);

  const handleLocationDetected = (detected: LocationPayload) => {
    setLocation(detected);
    setAudioUrl(null);
    setError(null);
    setStatusMessage(null);
    setPlaces(mockPlacesData(detected.latitude, detected.longitude));
  };

  const handleStatusUpdate = (status: string) => {
    setStatusMessage(statusCopy[status] ?? status);
  };

  const handleGeneratePodcast = async () => {
    if (!location) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsGenerating(true);
    setStatusMessage('Connecting to agent…');
    setError(null);
    setAudioUrl(null);

    try {
      const result = await streamMockPodcastFromLocation(location, {
        signal: controller.signal,
        onPlace: (place) => {
          setPlaces((current) => {
            const exists = current.find((p) => p.id === place.id);
            return exists ? current : [...current, place];
          });
        },
        onStatus: handleStatusUpdate,
      });

      if (previousAudioUrlRef.current && previousAudioUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previousAudioUrlRef.current);
      }

      previousAudioUrlRef.current = result.audioUrl;
      setAudioUrl(result.audioUrl);
      setPlaces(result.pois);
      setStatusMessage(
        result.source === 'fallback'
          ? 'Using a local fallback clip while the agent is offline.'
          : result.source === 'mock'
            ? 'Ready to play (mock audio response).'
            : 'Ready to play'
      );
    } catch (err) {
      if (controller.signal.aborted) {
        setStatusMessage('Request cancelled');
        return;
      }
      setError('Unable to generate the podcast right now. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    controllerRef.current?.abort();
    setIsGenerating(false);
    setStatusMessage('Request cancelled');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <Logo />
            {location && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-gray-500 px-4 py-2 bg-green-50 rounded-sm border border-green-200">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  <span>Location active</span>
                </div>
                <button
                  onClick={() => {
                    setLocation(null);
                    setPlaces([]);
                    if (previousAudioUrlRef.current && previousAudioUrlRef.current.startsWith('blob:')) {
                      URL.revokeObjectURL(previousAudioUrlRef.current);
                    }
                    previousAudioUrlRef.current = null;
                    setAudioUrl(null);
                    setError(null);
                    setStatusMessage(null);
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 border-2 border-gray-300 hover:border-gray-900 rounded-sm"
                >
                  Change location
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!location ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="max-w-2xl text-center space-y-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white mb-4">
                <Logo showText={false} />
              </div>
              <div className="space-y-6">
                <h2 className="text-gray-900">Audio guide for your surroundings</h2>
                <p className="text-gray-600 max-w-lg mx-auto">
                  Share your location and we’ll stream a mini-podcast about the closest
                  points of interest.
                </p>
              </div>
              <LocationDetector onLocationDetected={handleLocationDetected} />
              <div className="pt-8 border-t border-gray-200 max-w-md mx-auto">
                <p className="text-gray-500 mb-4">How it works:</p>
                <div className="space-y-3 text-left">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      1
                    </span>
                    <p className="text-gray-600">Click to share your location</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      2
                    </span>
                    <p className="text-gray-600">We find nearby points of interest</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center">
                      3
                    </span>
                    <p className="text-gray-600">Stream a short podcast about them</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-sm flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">We hit a snag</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-3 py-1.5 rounded-sm bg-gray-100 border border-gray-200 text-gray-700 font-mono">
                Lat {location.latitude.toFixed(4)}, Lng {location.longitude.toFixed(4)}
              </span>
              {location.accuracy && (
                <span className="px-3 py-1.5 rounded-sm bg-green-50 border border-green-200 text-green-700">
                  ±{Math.round(location.accuracy)}m accuracy
                </span>
              )}
              <span className="px-3 py-1.5 rounded-sm bg-gray-100 border border-gray-200 text-gray-600">
                Captured {new Date(location.timestamp ?? Date.now()).toLocaleTimeString()}
              </span>
            </div>

            <PlacesList places={places} />

            <PodcastPlayer
              audioUrl={audioUrl}
              isGenerating={isGenerating}
              statusMessage={statusMessage}
              onGenerate={handleGeneratePodcast}
              onCancel={handleCancel}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <Logo />
            <p className="text-gray-500">© 2025 8eleven</p>
          </div>
        </div>
      </footer>
    </div>
  );
}