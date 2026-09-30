"use client";

import { GithubIcon, YoutubeIcon, InstagramIcon, TwitterIcon, DiscordIcon } from "@/components/icons";
import { SOCIAL_LINKS, GITHUB_URL, APP_NAME } from "@/lib/constants";
import { useStaggerReveal } from "@/hooks/use-gsap";

const iconMap: Record<string, typeof GithubIcon> = {
  github: GithubIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  discord: DiscordIcon,
};

const hoverColors: Record<string, string> = {
  github: "var(--text-primary)",
  youtube: "#ff0000",
  instagram: "#e1306c",
  twitter: "var(--text-primary)",
  discord: "#5865f2",
};

export function Footer() {
  return (
    <footer className="relative z-10 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-8">
          {/* Social icons */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((link) => {
              const Icon = iconMap[link.type];
              if (!Icon) return null;
              const hc = hoverColors[link.type] || "var(--accent)";
              return (
                <a
                  key={link.type}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.name}
                  className="social-circle group relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 hover:scale-110"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--bg-card)",
                    ["--hover-color" as string]: hc,
                  }}
                >
                  <Icon
                    size={17}
                    className="transition-colors duration-300"
                    style={{ color: "var(--text-muted)" }}
                  />
                </a>
              );
            })}
          </div>

          {/* Credit */}
          <div className="text-center space-y-1.5">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Built by{" "}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
                style={{ color: "var(--accent)" }}
              >
                tech-anupam
              </a>
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)", opacity: 0.5 }}>
              {APP_NAME} / open source file sharing
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
