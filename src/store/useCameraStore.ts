import { create } from "zustand";

interface CameraState {
  stream: MediaStream | null;
  isReady: boolean;
  initCamera: () => Promise<void>;
  getStream: () => MediaStream | null;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  stream: null,
  isReady: false,

  initCamera: async () => {
    // If already have an active stream, skip
    const existing = get().stream;
    if (existing && existing.active) {
      set({ isReady: true });
      return;
    }

    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        set({ stream, isReady: true });
      }
    } catch (err) {
      // Silently handle - camera not available or permission denied
      console.log("Camera init skipped:", err);
      set({ isReady: false });
    }
  },

  getStream: () => get().stream,
}));
