import React, { useState } from 'react';

const RecordAudio = () => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  let mediaRecorder;
  let audioChunks = [];

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    audioChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
        mediaRecorder.start();
        setRecording(true);
      })
      .catch(error => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setRecording(false);
  };

  const handleDataAvailable = event => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
      console.log("Recorded audio data:", event.data);
    }
  };

  const onFileUpload = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', audioBlob);

    setUploading(true);
    setUploadProgress(0);

    const response = await fetch('https://testrepo.nextsolutions.in/STTupload', {
      method: 'POST',
      body: formData,
      onUploadProgress: progressEvent => {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgress(progress);
      }
    });

    const data = await response.json();

    if (data.transcript) {
      setTranscript(data.transcript);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  return (
    <div>
      <h1>Transcription Service</h1>
      <button onClick={toggleRecording}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      {recording ? (
        <p>Recording audio... Click "Stop Recording" to finish.</p>
      ) : (
        <p>Click "Start Recording" to begin recording audio.</p>
      )}
      <button onClick={onFileUpload} disabled={audioChunks.length === 0 || uploading}>
        {uploading ? `Uploading... ${uploadProgress}%` : "Upload and Transcribe"}
      </button>
      {transcript && (
        <div>
          <h2>Transcript</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default RecordAudio;
