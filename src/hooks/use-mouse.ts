"use client";

import { useEffect, useRef, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export function useMouse() {
  const position = useRef<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0.5,
    normalizedY: 0.5,
  });

  const update = useCallback((e: MouseEvent) => {
    position.current = {
      x: e.clientX,
      y: e.clientY,
      normalizedX: e.clientX / window.innerWidth,
      normalizedY: 1.0 - e.clientY / window.innerHeight,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", update);
    return () => window.removeEventListener("mousemove", update);
  }, [update]);

  return position;
}
