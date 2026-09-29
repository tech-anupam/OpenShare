"use client";

import { useState, useEffect, useCallback } from "react";
import { GREETINGS, APP_NAME } from "@/lib/constants";

export function SplashScreen() {
  const [phase, setPhase] = useState<"greetings" | "final" | "done">("greetings");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  const advanceGreeting = useCallback(() => {
    if (currentIndex < GREETINGS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setPhase("final");
    }
  }, [currentIndex]);

  useEffect(() => {
    if (phase === "greetings") {
      const timer = setTimeout(advanceGreeting, 500);
      return () => clearTimeout(timer);
    }

    if (phase === "final") {
      const timer = setTimeout(() => {
        setExiting(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [phase, advanceGreeting]);

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(() => setPhase("done"), 500);
      return () => clearTimeout(timer);
    }
  }, [exiting]);

  if (phase === "done") return null;

  return (
    <div className={`splash-container ${exiting ? "splash-exit" : ""}`}>
      {phase === "greetings" && (
        <span
          key={currentIndex}
          className="greeting-text"
          style={{
            fontSize: "clamp(2rem, 8vw, 5rem)",
            color: "var(--text-primary)",
          }}
        >
          {GREETINGS[currentIndex].text}
        </span>
      )}

      {phase === "final" && (
        <span
          className="greeting-final"
          style={{
            fontSize: "clamp(2.5rem, 10vw, 6rem)",
            color: "var(--text-primary)",
          }}
        >
          {APP_NAME}
        </span>
      )}
    </div>
  );
}
