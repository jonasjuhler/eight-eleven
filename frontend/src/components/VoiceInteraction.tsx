import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Square } from 'lucide-react';
import { Button } from './ui/button';
import { generatePodcastContent } from '../utils/mockData';

interface VoiceInteractionProps {
  userLocation: { lat: number; lng: number };
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
}

export function VoiceInteraction({ userLocation, isListening, onListeningChange }: VoiceInteractionProps) {
  const [transcript, setTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleVoiceQuery(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        setError('Voice recognition error. Please try again.');
        onListeningChange(false);
      };

      recognitionRef.current.onend = () => {
        onListeningChange(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    setError(null);
    setTranscript('');
    setResponse('');
    
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      recognitionRef.current.start();
      onListeningChange(true);
    } catch (error) {
      setError('Could not start voice recognition. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onListeningChange(false);
  };

  const handleVoiceQuery = (query: string) => {
    // Generate response based on query
    const podcastContent = generatePodcastContent('', query);
    setResponse(podcastContent);
    
    // Speak the response
    speakResponse(podcastContent);
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) {
      setError('Text-to-speech is not supported in your browser.');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for podcast feel
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setError('Could not play audio response.');
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="border-t-2 border-gray-200 pt-12 mt-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-gray-900">Ask about what you see</h2>
          <p className="text-gray-600">
            Press the button and speak naturally
          </p>
        </div>

        {/* Voice Controls */}
        <div className="flex flex-col items-center gap-6">
          {!isListening ? (
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={startListening}
                className="bg-gray-900 text-white hover:bg-gray-800 px-16 py-10 rounded-full transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Mic className="mr-3 h-7 w-7" />
                <span className="text-lg">Start speaking</span>
              </Button>
              <p className="text-gray-500">Click and tell us what you're looking at</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={stopListening}
                className="bg-red-600 text-white hover:bg-red-700 px-16 py-10 rounded-full transition-all shadow-xl animate-pulse"
              >
                <MicOff className="mr-3 h-7 w-7" />
                <span className="text-lg">Stop</span>
              </Button>
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="font-mono">Recording now...</span>
              </div>
            </div>
          )}

          {isPlaying && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-6 rounded-sm transition-all"
            >
              <Square className="mr-2 h-5 w-5 fill-current" />
              Stop playback
            </Button>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <p className="text-blue-900">You said:</p>
              </div>
              <p className="text-blue-950 text-lg">{transcript}</p>
            </div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="bg-gray-900 text-white p-8 rounded-sm shadow-lg">
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                <Volume2 className="h-6 w-6" />
                <p className="text-gray-300">Audio Guide:</p>
              </div>
              <p className="text-white whitespace-pre-line leading-relaxed text-lg">
                {response}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-6 rounded-sm">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Example Queries */}
        {!transcript && !isListening && (
          <div className="border-t border-gray-200 pt-10">
            <div className="space-y-5">
              <p className="text-gray-900 text-center">Or try these examples:</p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "I'm looking at Rundetårn in Copenhagen",
                  "Tell me about Nyhavn",
                  "What is Amalienborg Palace?",
                  "I'm at Tivoli Gardens"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTranscript(example);
                      handleVoiceQuery(example);
                    }}
                    className="text-left p-5 border-2 border-gray-200 rounded-sm hover:border-gray-900 hover:shadow-md transition-all text-gray-700 bg-white"
                  >
                    <span className="text-gray-400 mr-2">→</span>
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}