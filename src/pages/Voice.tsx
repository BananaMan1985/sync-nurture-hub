import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import OpenAI from 'openai';

// Initialize OpenAI client with environment variable
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: For demo only; use backend in production
});

const Voice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setRecordingStatus('recorded');
        transcribeAudio(audioBlob); // Auto-transcribe after stopping
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingStatus('recording');
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      toast({
        title: "Recording stopped",
        description: "Processing your audio...",
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      setTranscription(transcriptionResponse.text);
      toast({
        title: "Transcription complete",
        description: "Your audio has been transcribed successfully.",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: error.message || "Could not transcribe audio. Please try again.",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 md:px-6"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Voice Input</h1>
        </div>

        <div className="flex justify-center items-center my-12">
          <div className="bg-white rounded-lg shadow-sm border border-border/30 p-8 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-medium mb-6">Voice Recorder</h2>
            
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <div 
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors
                    ${isRecording ? 'bg-red-600' : 'bg-[#2D3B22]'}
                    ${isTranscribing ? 'animate-pulse' : ''}`}
                >
                  {isRecording ? 
                    <Square className="h-10 w-10 text-white" /> : 
                    <Mic className="h-10 w-10 text-white" />
                  }
                </div>
              </div>
            </div>
            
            <Button 
              className={`w-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2D3B22] hover:bg-[#3c4f2d]'} text-white mb-4`}
              onClick={toggleRecording}
              disabled={isTranscribing}
            >
              {isRecording ? 
                <Square className="mr-2 h-4 w-4" /> : 
                <Mic className="mr-2 h-4 w-4" />
              }
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            
            {/* Combined Audio and Transcription Display */}
            {recordingStatus === 'recorded' && audioURL && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full mt-4 p-4 bg-gray-50 rounded-md border border-gray-200"
              >
                <h3 className="text-lg font-medium mb-2">Your Recording</h3>
                <audio src={audioURL} controls className="w-full mb-4" />
                
                {isTranscribing ? (
                  <p className="text-sm text-gray-500 italic">Transcribing...</p>
                ) : transcription ? (
                  <div>
                    <h4 className="text-md font-medium mb-1">Transcription</h4>
                    <p className="text-sm text-gray-800 bg-white p-2 rounded-md border border-gray-300">{transcription}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Transcription failed or pending.</p>
                )}
              </motion.div>
            )}
            
            <p className="text-center text-muted-foreground mt-4">
              Tap to record a voice note. It will be transcribed and added as a task.
            </p>
          </div>
        </div>

        <div className="text-xs text-center text-muted-foreground mt-12 pb-6">
          Built by Sagan
        </div>
      </motion.div>
    </Layout>
  );
};

export default Voice;