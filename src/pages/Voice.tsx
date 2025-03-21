import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Mic, Square, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Initialize OpenAI client with environment variable safely
const openai = (() => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key missing. Voice transcription and title generation will be disabled.');
      return null;
    }
    
    return new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: For demo only; use backend in production
    });
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return null;
  }
})();

const Voice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Could not verify user. Please log in again.",
        });
        return;
      }
      if (user) {
        setUserRole(user.user_metadata.role || null);
      } else {
        toast({
          variant: "destructive",
          title: "Not Logged In",
          description: "Please log in to use voice features.",
        });
      }
    };
    fetchUserRole();
  }, [toast]);

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
        setRecordingStatus('recorded');
        
        if (openai) {
          transcribeAudio(audioBlob);
        } else {
          toast({
            variant: "destructive",
            title: "Transcription unavailable",
            description: "OpenAI API key is missing. Transcription and title generation are disabled.",
          });
        }
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
    if (!openai) {
      toast({
        variant: "destructive",
        title: "Transcription unavailable",
        description: "OpenAI API key is missing. Transcription and title generation are disabled.",
      });
      return;
    }
    
    setIsTranscribing(true);
    try {
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      const transcribedText = transcriptionResponse.text;
      setTranscription(transcribedText);

      // Generate title using OpenAI 3.5 model
      const titleResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates concise task titles based on provided text.' },
          { role: 'user', content: `Generate a concise title for a task based on this transcription: ${transcribedText}` },
        ],
        max_tokens: 10,
      });

      const generatedTitle = titleResponse.choices[0].message.content.trim();

      // Add task to Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication failed');
      }

      if (user.user_metadata.role === "assistant") {
        const { error } = await supabase
        .from('tasks')
        .insert({
          title: generatedTitle,
          task: transcribedText,
          created_at: new Date().toISOString(),
          created_by: user.user_metadata.owner_id,
          assigned_to:user.id,
          status: "inbox"
        });

      if (error) throw error;

      toast({
        title: "Task Added",
        description: "Your voice note has been transcribed and added to your tasks!",
      });
      } else {
        const { data: publicUser, error: publicError } = await supabase.from("users").select("*").eq("id", user.id);
  
        if (publicError) throw publicError;

        console.log(publicUser[0].assistant_id)

        if (publicUser[0].assistant_id) {
          const { error } = await supabase
        .from('tasks')
        .insert({
          title: generatedTitle,
          task: transcribedText,
          created_at: new Date().toISOString(),
          created_by: user.id,
          assigned_to:publicUser[0].assistant_id,
          status: "inbox"
        });

      if (error) throw error;

      toast({
        title: "Task Added",
        description: "Your voice note has been transcribed and added to your tasks!",
      });
        } else {
          const { error } = await supabase
        .from('tasks')
        .insert({
          title: generatedTitle,
          task: transcribedText,
          created_at: new Date().toISOString(),
          created_by: user.id,
          // assigned_to:publicUser[0].assistant_id,
          status: "inbox"
        });

      if (error) throw error;

      toast({
        title: "Task Added",
        description: "Your voice note has been transcribed and added to your tasks!",
      });
        }
  
      }

      

      setTranscription(null);
      setRecordingStatus('idle');
    } catch (error) {
      console.error('Transcription or task creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to transcribe or add task. Please try again.",
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

        {!openai && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Missing</AlertTitle>
            <AlertDescription>
              The OpenAI API key is not configured. Voice transcription and title generation are disabled. 
              Please add the VITE_OPENAI_API_KEY environment variable to enable these features.
            </AlertDescription>
          </Alert>
        )}

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
              disabled={isTranscribing || userRole === null}
            >
              {isRecording ? 
                <Square className="mr-2 h-4 w-4" /> : 
                <Mic className="mr-2 h-4 w-4" />
              }
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            
            {isTranscribing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full mt-4 p-4 bg-gray-50 rounded-md border border-gray-200"
              >
                <p className="text-sm text-gray-500 italic">Transcribing and adding task...</p>
              </motion.div>
            )}
            
            <p className="text-center text-muted-foreground mt-4">
              {openai ? "Tap to record a voice note. It will be transcribed and added as a task." : "Tap to record a voice note. Transcription and task creation are currently disabled."}
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