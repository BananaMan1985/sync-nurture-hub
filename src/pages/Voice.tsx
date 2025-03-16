
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Voice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <div className="flex border-b border-border/30 mb-8">
          <Button 
            variant="link" 
            className="text-foreground font-medium px-0 py-3 mr-6 border-b-2 border-primary"
          >
            <Mic className="mr-2 h-5 w-5" />
            Voice Task
          </Button>
          <Button 
            variant="link" 
            className="text-muted-foreground px-0 py-3 mr-6 border-b-2 border-transparent"
            onClick={() => window.location.href = '/tasks'}
          >
            Project Tracker
          </Button>
          <Button 
            variant="link" 
            className="text-muted-foreground px-0 py-3 mr-6 border-b-2 border-transparent"
            onClick={() => window.location.href = '/reports'}
          >
            End of Day Reports
          </Button>
          <Button 
            variant="link" 
            className="text-muted-foreground px-0 py-3 mr-6 border-b-2 border-transparent"
            onClick={() => window.location.href = '/library'}
          >
            Reference
          </Button>
        </div>

        <div className="flex justify-center items-center my-12">
          <div className="bg-white rounded-lg shadow-sm border border-border/30 p-12 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-medium mb-6">Voice Recorder</h2>
            
            <div className="relative mb-10">
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-600' : 'bg-[#2D3B22]'}`}>
                  <Mic className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-[#2D3B22] hover:bg-[#3c4f2d] text-white mb-4"
              onClick={toggleRecording}
            >
              <Mic className="mr-2 h-4 w-4" />
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            
            <p className="text-center text-muted-foreground mt-2">
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
