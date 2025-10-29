import React, { useEffect, useRef,useState } from "react";
import { fetchGuacRecordingFile } from "Services/RecordingsService";
import Guacamole from "guacamole-common-js";
import { Toast } from "bootstrap";
 
const GuacRecordingPlayer = ({ identifier, logUuid, onClose }) => {
  const playerRef = useRef(null);
  // backendUrl no longer needed for API calls
 
  useEffect(() => {
    async function loadRecording() {
      try {
        // Fetch the entire recording file using the service
        const buffer = await fetchGuacRecordingFile(identifier, logUuid);
        // Wrap with ArrayBufferReader
        const reader = new Guacamole.ArrayBufferReader(buffer);
        // Create session recording
        const recording = new Guacamole.SessionRecording(reader);
        // Attach display canvas
        const display = recording.getDisplay();
        if (playerRef.current) {
          playerRef.current.innerHTML = "";
          playerRef.current.appendChild(display.getElement());
        }
        // Start playback (offline mode uses play(), not connect())
        recording.play();
      } catch (error) {
        Toast.error("Failed to load recording");
      }
    }
    loadRecording();
 
    return () => {
      if (playerRef.current) {
        playerRef.current.innerHTML = "";
      }
    };
  }, [identifier, logUuid, backendUrl]);
 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-4 relative w-full max-w-4xl h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black text-3xl"
        >
          ×
        </button>
        <div ref={playerRef} className="flex-1 w-full border rounded" />
      </div>
    </div>
  );
};
 
export default GuacRecordingPlayer;
 