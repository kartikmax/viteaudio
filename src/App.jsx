import React, { useState } from 'react';

const App = () => {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");

  const onFileChange = event => {
    setFile(event.target.files[0]);
  };

  const onFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://testrepo.nextsolutions.in/STTupload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.transcript) {
      setTranscript(data.transcript);
      console.log("Upload complete!");
    }
  };

  const getTranscript = async () => {
    const response = await fetch('https://testrepo.nextsolutions.in/STTuploadget');
    const data = await response.json();

    if (data.transcript) {
      setTranscript(data.transcript);
    }
  };

  return (
    <div>
      <h1>Transcription Service</h1>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload!</button>
      <button onClick={getTranscript}>Get Transcript!</button>
      {transcript && (
        <div>
          <h2>Transcript</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default App;
