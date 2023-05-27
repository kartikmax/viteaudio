import React, { useState, useRef } from "react";

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcript,setTranscript]=useState(null)
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/wav" });
          setAudioBlob(blob);
          chunks.length = 0;
        };

        mediaRecorder.start();
        setRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleUpload = () => {
    if (audioBlob) {
      const formData = new FormData();
      formData.append("file", audioBlob);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://testrepo.nextsolutions.in/STTupload");

      xhr.upload.addEventListener("progress", (event) => {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.transcript) {
              // Handle the transcript response here
              console.log("Transcript:", data);
              setTranscript(data.transcript)
            }
          } else {
            console.error("Upload failed:", xhr.status);
          }
          setUploadProgress(0);
        }
      };

      xhr.send(formData);
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>

      <button
        onClick={handleUpload}
        disabled={!audioBlob || uploadProgress > 0}
      >
        Upload Audio
      </button>
      {uploadProgress > 0 && <div>Upload Progress: {uploadProgress}%</div>}
      {transcript&&<div> {transcript} </div> }
    </div>
  );
};

export default AudioRecorder;
