import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// This key will need to be replaced with a real OpenAI API key later
const OPENAI_API_KEY = "your-openai-api-key-here";

const Voice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

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
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setRecordingStatus('recorded');
        
        // Auto-transcribe after recording will be implemented later
        // transcribeAudio(audioBlob);
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
      // Stop all audio tracks
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

  // The transcribeAudio function will be implemented later
  const transcribeAudio = async (audioBlob: Blob) => {
    // Implementation will be added later
    console.log("Transcription functionality to be implemented");
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
          <h1 className="text-3xl font-bold tracking-tight">Voice Tasks</h1>
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
            
            {recordingStatus === 'recorded' && audioURL && (
              <div className="w-full mt-4">
                <h3 className="text-lg font-medium mb-2">Recording</h3>
                <audio src={audioURL} controls className="w-full mb-4" />
              </div>
            )}
            
            {transcription && (
              <div className="w-full mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-lg font-medium mb-2">Transcription</h3>
                <p className="text-sm">{transcription}</p>
              </div>
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
