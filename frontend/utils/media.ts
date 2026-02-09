export async function requestMediaStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
}

export function createRecorder(stream: MediaStream): MediaRecorder {
  return new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9,opus",
  });
}
