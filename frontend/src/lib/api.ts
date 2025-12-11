import { LocationPayload, PointOfInterest } from '../types';
import { mockPlacesData } from '../utils/mockData';

export type { LocationPayload, PointOfInterest } from '../types';

export type PodcastStreamResult = {
  audioUrl: string;
  pois: PointOfInterest[];
  source: 'live' | 'fallback' | 'mock';
};

type StreamOptions = {
  signal?: AbortSignal;
  onPlace?: (place: PointOfInterest) => void;
  onStatus?: (status: string) => void;
};

const API_ENDPOINT =
  import.meta.env.VITE_PODCAST_ENDPOINT ??
  'https://api.example.com/podcast/stream';

const AUDIO_CONTENT_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac'];

const MOCK_AUDIO_URL = '/test.mp3';

export async function streamMockPodcastFromLocation(
  location: LocationPayload,
  options: StreamOptions = {}
): Promise<PodcastStreamResult> {
  const abortIfNeeded = () => {
    if (options.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
  };

  const pois = mockPlacesData(location.latitude, location.longitude);

  options.onStatus?.('connecting');
  abortIfNeeded();

  options.onStatus?.('receiving-events');
  for (const place of pois) {
    abortIfNeeded();
    options.onPlace?.(place);
  }

  options.onStatus?.('streaming-audio');
  abortIfNeeded();

  return {
    audioUrl: MOCK_AUDIO_URL,
    pois,
    source: 'mock',
  };
}

export async function streamPodcastFromLocation(
  location: LocationPayload,
  options: StreamOptions = {}
): Promise<PodcastStreamResult> {
  const payload = {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    timestamp: location.timestamp ?? Date.now(),
    source: location.source,
  };

  try {
    options.onStatus?.('connecting');

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();

    if (contentType.includes('application/x-ndjson')) {
      return await readNdjsonStream(response, location, options);
    }

    if (AUDIO_CONTENT_TYPES.some((type) => contentType.includes(type))) {
      return await readAudioStream(response, location, options);
    }

    // Unknown content-type, try audio as a fallback.
    return await readAudioStream(response, location, options);
  } catch (error) {
    console.error('Falling back to mock podcast:', error);
    return buildFallbackPodcast(location, options);
  }
}

async function readAudioStream(
  response: Response,
  location: LocationPayload,
  options: StreamOptions
): Promise<PodcastStreamResult> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No readable stream available');
  }

  const chunks: Uint8Array[] = [];
  const contentType = response.headers.get('content-type') || 'audio/mpeg';

  options.onStatus?.('streaming-audio');

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
    }
  }

  const blob = new Blob(chunks, { type: contentType });
  const audioUrl = URL.createObjectURL(blob);
  const pois = mockPlacesData(location.latitude, location.longitude);

  return { audioUrl, pois, source: 'live' };
}

async function readNdjsonStream(
  response: Response,
  location: LocationPayload,
  options: StreamOptions
): Promise<PodcastStreamResult> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No NDJSON stream available');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  const pois: PointOfInterest[] = [];

  options.onStatus?.('receiving-events');

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const message = JSON.parse(line);
        if (message.type === 'poi' && message.data) {
          const place = normalizePoi(message.data);
          if (place) {
            pois.push(place);
            options.onPlace?.(place);
          }
        }
        if (message.audioUrl) {
          return {
            audioUrl: message.audioUrl,
            pois: pois.length ? pois : mockPlacesData(location.latitude, location.longitude),
            source: 'live',
          };
        }
      } catch (error) {
        console.warn('Failed to parse NDJSON line', error);
      }
    }
  }

  throw new Error('Stream ended without audioUrl');
}

function normalizePoi(input: any): PointOfInterest | null {
  if (!input) return null;
  return {
    id: String(input.id ?? input.placeId ?? crypto.randomUUID()),
    name: input.name ?? 'Point of interest',
    description: input.description ?? input.vicinity ?? 'Nearby location',
    lat: input.lat ?? input.latitude ?? 0,
    lng: input.lng ?? input.longitude ?? 0,
    distance: input.distance ?? 0.5,
    category: input.category ?? input.types?.[0] ?? 'Point of interest',
  };
}

function buildFallbackPodcast(
  location: LocationPayload,
  options: StreamOptions
): PodcastStreamResult {
  options.onStatus?.('fallback-local');

  const pois = mockPlacesData(location.latitude, location.longitude);
  const summaryText = `You're near ${pois[0]?.name ?? 'a notable spot'}. \
We've prepared a short sample clip while the live agent is unavailable.`;

  const audioUrl = generateTestToneUrl(summaryText);

  return {
    audioUrl,
    pois,
    source: 'fallback',
  };
}

function generateTestToneUrl(text: string): string {
  const sampleRate = 44100;
  const durationSec = 1.2;
  const frequency = 660;
  const samples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i++) {
    const amplitude = i < sampleRate * 0.1 ? 0 : 0.2; // fade-in
    const sample =
      Math.sin((2 * Math.PI * frequency * i) / sampleRate) *
      0.5 *
      amplitude;
    view.setInt16(44 + i * 2, sample * 0x7fff, true);
  }

  // Add a subtle hash of the text into the tail to vary tone slightly.
  const hash = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = 0; i < Math.min(100, samples); i++) {
    const idx = samples - 1 - i;
    const sample =
      Math.sin((2 * Math.PI * ((hash % 400) + 200) * idx) / sampleRate) * 0.1;
    view.setInt16(44 + idx * 2, sample * 0x7fff, true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
