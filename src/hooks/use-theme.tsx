"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: (event?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("openshare-theme") as Theme | null;
    const initial = stored || "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);
  }, []);

  const toggle = useCallback((event?: React.MouseEvent) => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      event
    ) {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = (document as unknown as {
        startViewTransition: (cb: () => void) => { ready: Promise<void> };
      }).startViewTransition(() => {
        setTheme(nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
        localStorage.setItem("openshare-theme", nextTheme);
      });

      transition.ready.then(() => {
        const isDark = nextTheme === "dark";
        const clip = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: isDark ? clip : [...clip].reverse(),
          },
          {
            duration: 450,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: isDark
              ? "::view-transition-new(root)"
              : "::view-transition-old(root)",
          }
        );
      });
      return;
    }

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("openshare-theme", nextTheme);
  }, [theme]);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
