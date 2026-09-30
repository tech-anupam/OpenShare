"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";

    let loaded = false;

    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        if (!ref.current) return;
        loaded = true;

        gsap.to(ref.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 90%",
            once: true,
          },
        });
      });
    }).catch(() => {
      // Fallback: just show it
      if (el && !loaded) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }
    });

    return () => {
      if (el && !loaded) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }
    };
  }, []);

  return ref;
}

export function useStaggerReveal<T extends HTMLElement>(stagger = 0.08) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    children.forEach((child) => {
      child.style.opacity = "0";
      child.style.transform = "translateY(16px)";
    });

    let loaded = false;

    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        if (!ref.current) return;
        loaded = true;

        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            once: true,
          },
        });
      });
    }).catch(() => {
      if (!loaded) {
        children.forEach((child) => {
          child.style.opacity = "1";
          child.style.transform = "translateY(0)";
        });
      }
    });
  }, [stagger]);

  return ref;
}
