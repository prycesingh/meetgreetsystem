"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "recording"
  | "stopped"
  | "error";

interface UseRecorderState {
  status: RecorderStatus;
  error: string | null;
  stream: MediaStream | null;
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
  audioLevel: number;
  requestPermissions: () => Promise<MediaStream | null>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  toggleCamera: () => void;
  toggleMic: () => void;
  releaseMedia: () => void;
}

const getSupportedMimeType = () => {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
};

const getNetworkProfile = () => {
  if (typeof navigator === "undefined") {
    return "good";
  }

  const connection = (navigator as any).connection as
    | {
        effectiveType?: string;
        downlink?: number;
      }
    | undefined;

  if (!connection) {
    return "good";
  }

  const effectiveType = connection.effectiveType || "";
  const downlink = connection.downlink ?? null;

  if (effectiveType === "slow-2g" || effectiveType === "2g") {
    return "poor";
  }

  if (effectiveType === "3g") {
    return "medium";
  }

  if (typeof downlink === "number") {
    if (downlink < 1.5) {
      return "poor";
    }
    if (downlink < 3) {
      return "medium";
    }
  }

  return "good";
};

const getRecorderBitrates = () => {
  const profile = getNetworkProfile();

  if (profile === "poor") {
    return { video: 1_500_000, audio: 96_000 };
  }

  if (profile === "medium") {
    return { video: 3_500_000, audio: 128_000 };
  }

  return { video: 5_000_000, audio: 160_000 };
};

export const useRecorder = (): UseRecorderState => {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const stopAudioMonitoring = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const startAudioMonitoring = useCallback(
    (mediaStream: MediaStream) => {
      stopAudioMonitoring();

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const buffer = new Uint8Array(analyser.fftSize);

      const tick = () => {
        analyser.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i += 1) {
          const normalized = (buffer[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / buffer.length);
        setAudioLevel(rms);
        animationRef.current = requestAnimationFrame(tick);
      };

      animationRef.current = requestAnimationFrame(tick);
    },
    [stopAudioMonitoring],
  );

  const requestPermissions = useCallback(async () => {
    if (stream) {
      return stream;
    }

    setStatus("requesting");
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 1280, ideal: 1920 },
          height: { min: 720, ideal: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 48000 },
        },
      });
      if (typeof window !== "undefined") {
        const globalStreams = (
          window as typeof window & {
            __activeMediaStreams?: MediaStream[];
          }
        ).__activeMediaStreams;
        const nextStreams = globalStreams ? [...globalStreams] : [];
        if (!nextStreams.includes(mediaStream)) {
          nextStreams.push(mediaStream);
        }
        (
          window as typeof window & {
            __activeMediaStreams?: MediaStream[];
          }
        ).__activeMediaStreams = nextStreams;
      }
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setStatus("ready");
      setIsCameraEnabled(true);
      setIsMicEnabled(true);
      startAudioMonitoring(mediaStream);
      return mediaStream;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to access media devices.";
      setError(message);
      setStatus("error");
      return null;
    }
  }, [startAudioMonitoring, stream]);

  const startRecording = useCallback(async () => {
    const activeRecorder = recorderRef.current;
    if (activeRecorder && activeRecorder.state === "recording") {
      return;
    }

    const activeStream = stream ?? (await requestPermissions());
    if (!activeStream) {
      return;
    }

    const mimeType = getSupportedMimeType();
    const bitrates = getRecorderBitrates();
    const recorder = new MediaRecorder(activeStream, {
      mimeType: mimeType || undefined,
      videoBitsPerSecond: bitrates.video,
      audioBitsPerSecond: bitrates.audio,
    });

    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      setStatus("stopped");
      recorderRef.current = null;
    };

    recorder.start();
    recorderRef.current = recorder;
    setStatus("recording");
  }, [requestPermissions, stream]);

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return null;
    }

    const stopPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });
        resolve(blob);
        setStatus("stopped");
        recorderRef.current = null;
      };
    });

    recorder.stop();
    return stopPromise;
  }, []);

  const toggleCamera = useCallback(() => {
    if (!stream) {
      return;
    }
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsCameraEnabled(track.enabled);
    });
  }, [stream]);

  const toggleMic = useCallback(() => {
    if (!stream) {
      return;
    }
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMicEnabled(track.enabled);
    });
  }, [stream]);

  const releaseMedia = useCallback(() => {
    const activeStream = streamRef.current;
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
    }
    if (typeof window !== "undefined") {
      const globalStreams = (
        window as typeof window & {
          __activeMediaStreams?: MediaStream[];
        }
      ).__activeMediaStreams;
      if (globalStreams && globalStreams.length > 0) {
        globalStreams.forEach((streamItem) => {
          streamItem.getTracks().forEach((track) => track.stop());
        });
      }
      (
        window as typeof window & {
          __activeMediaStreams?: MediaStream[];
        }
      ).__activeMediaStreams = [];
    }
    streamRef.current = null;
    setStream(null);
    setStatus("idle");
    stopAudioMonitoring();
  }, [stopAudioMonitoring]);

  useEffect(() => {
    if (!isMicEnabled || !stream) {
      stopAudioMonitoring();
      return;
    }
    startAudioMonitoring(stream);
  }, [isMicEnabled, startAudioMonitoring, stopAudioMonitoring, stream]);

  useEffect(() => () => releaseMedia(), [releaseMedia]);

  return {
    status,
    error,
    stream,
    isCameraEnabled,
    isMicEnabled,
    audioLevel,
    requestPermissions,
    startRecording,
    stopRecording,
    toggleCamera,
    toggleMic,
    releaseMedia,
  };
};
