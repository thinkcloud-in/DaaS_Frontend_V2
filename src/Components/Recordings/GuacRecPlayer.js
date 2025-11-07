import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecordingFileThunk, clearRecordingFile } from "../../redux/features/Recordings/RecordingsSlice";
import {
  selectRecordingFile,
  selectRecordingFileLoading,
  selectRecordingFileError,
} from "../../redux/features/Recordings/RecordingsSelectors";
import Guacamole from "guacamole-common-js";
import { toast } from "react-toastify";

const GuacRecordingPlayer = ({ identifier, logUuid, onClose }) => {
  const playerRef = useRef(null);
  const dispatch = useDispatch();

  const buffer = useSelector(selectRecordingFile);
  const loading = useSelector(selectRecordingFileLoading);
  const error = useSelector(selectRecordingFileError);

  useEffect(() => {
    dispatch(fetchRecordingFileThunk({ identifier, logUuid }));

    return () => {
      dispatch(clearRecordingFile());
      if (playerRef.current) {
        playerRef.current.innerHTML = "";
      }
    };
  }, [dispatch, identifier, logUuid]);

  useEffect(() => {
    if (buffer && playerRef.current) {
      try {
        const reader = new Guacamole.ArrayBufferReader(buffer);
        const recording = new Guacamole.SessionRecording(reader);
        const display = recording.getDisplay();
        playerRef.current.innerHTML = "";
        playerRef.current.appendChild(display.getElement());
        recording.play();
      } catch (err) {
        toast.error("Failed to play recording");
      }
    }
  }, [buffer]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-4 relative w-full max-w-4xl h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black text-3xl"
        >
          ×
        </button>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">Loading...</div>
        ) : (
          <div ref={playerRef} className="flex-1 w-full border rounded" />
        )}
      </div>
    </div>
  );
};

export default GuacRecordingPlayer;