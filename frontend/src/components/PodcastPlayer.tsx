import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Loader2, Pause, Play, Waves, Square, RefreshCw } from 'lucide-react';

interface PodcastPlayerProps {
  audioUrl: string | null;
  isGenerating: boolean;
  statusMessage?: string | null;
  onGenerate: () => void;
  onCancel?: () => void;
  onTriggerWorkflow?: () => void;
  isTriggeringWorkflow?: boolean;
}

export function PodcastPlayer({
  audioUrl,
  isGenerating,
  statusMessage,
  onGenerate,
  onCancel,
  onTriggerWorkflow,
  isTriggeringWorkflow = false,
}: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!audio.duration || Number.isNaN(audio.duration)) return;
      setDuration(audio.duration);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const displayTime = (value: number) => {
    if (!value || Number.isNaN(value)) return '0:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="border-t-2 border-gray-200 pt-12 mt-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {onTriggerWorkflow && (
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-sm bg-gray-100 px-3 py-1 text-gray-600">
                <Waves className="h-4 w-4" />
                <span>ElevenLabs stream via n8n</span>
              </div>
              <h2 className="text-gray-900">Generate a podcast about these places</h2>
              <p className="text-gray-600 max-w-xl">
                We'll send your coordinates to the agent, pull nearby points of interest with
                Google Places, then stream back a short audio story.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {onCancel && isTriggeringWorkflow && (
                <Button variant="outline" onClick={onCancel} className="border-2 border-gray-300">
                  <Square className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button
                onClick={onTriggerWorkflow}
                disabled={isTriggeringWorkflow}
                className="bg-gray-900 text-white hover:bg-gray-800 px-5"
              >
                {isTriggeringWorkflow ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : audioUrl ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Waves className="mr-2 h-4 w-4" />
                    Generate podcast
                  </>
                )}
              </Button>
              <a
                href="https://elevenlabs.io/app/talk-to?agent_id=agent_7101kc7fq7c0eth96bycxvqasd3a&branch_id=agtbrch_0901kc7fq8zwfbab9v7fm1qpgbp6"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" className="border-2 border-gray-300">
                  Ask the agent
                </Button>
              </a>
            </div>
          </div>
        )}

        <div className="rounded-sm border-2 border-gray-200 p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">Podcast stream</p>
                <p className="text-gray-500 text-sm">
                  {statusMessage || (audioUrl ? 'Ready to play' : 'Waiting to generate')}
                </p>
              </div>
            </div>
            {audioUrl && (
              <div className="text-right">
                <p className="text-gray-900 font-mono text-sm">~{displayTime(duration)}</p>
                <p className="text-gray-500 text-xs">approx. length</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="h-2 w-full bg-gray-100 rounded-sm overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{displayTime((progress / 100) * (duration || 0))}</span>
              <span>{displayTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={togglePlayback}
              disabled={!audioUrl || isTriggeringWorkflow}
              className="bg-gray-900 text-white hover:bg-gray-800 px-6"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </>
              )}
            </Button>
            <p className="text-gray-500 text-sm">
              {audioUrl
                ? 'Hit play to listen to the generated clip.'
                : 'Generate first, then press play.'}
            </p>
          </div>

          <audio ref={audioRef} src={audioUrl ?? undefined} preload="auto" />
        </div>
      </div>
    </div>
  );
}
