import React from 'react';
import { ChatTranscript } from './ChatTranscript';

/**
 * SessionFeed is now powered by the full ChatTranscript component,
 * rendering real-time speech-to-text input and output transcriptions
 * directly from the Gemini Live API.
 */
export const SessionFeed: React.FC = () => {
  return <ChatTranscript />;
};

export default SessionFeed;
