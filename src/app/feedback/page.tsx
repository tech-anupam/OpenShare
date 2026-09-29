"use client";

import { useState } from "react";
import { StarIcon, CheckIcon, LoaderIcon } from "@/components/icons";
import { useToast } from "@/components/toast";

const WEB3FORMS_KEY = "11aa1ef9-4a02-474e-95aa-787d5d371e5c";

const recommendations = [
  { key: "A", label: "Yes, absolutely!" },
  { key: "B", label: "Maybe, with some improvements" },
  { key: "C", label: "No, not really" },
];

export default function FeedbackPage() {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [recommend, setRecommend] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0 || !liked.trim() || !improve.trim() || !recommend) {
      setError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `OpenShare Feedback - ${rating}/5 stars`,
          rating: `${rating}/5`,
          liked,
          improvements: improve,
          recommendation: recommend,
          email: email || "not provided",
          from_name: "OpenShare Feedback",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.success("Thank you for your feedback!");
      } else {
        throw new Error("Submission failed");
      }
    } catch {
      setError("Failed to submit. Please try again.");
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] animate-in">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full"
          style={{ background: "var(--success)", color: "#ffffff" }}
        >
          <CheckIcon size={28} />
        </div>
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Thank you
        </h2>
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          Your feedback has been submitted successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-lg mx-auto">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        OpenShare Feedback
      </h1>
      <p className="text-sm mt-1 mb-8" style={{ color: "var(--text-muted)" }}>
        We would love to hear your thoughts on OpenShare!
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: "var(--text-primary)" }}
          >
            Overall, how satisfied are you with OpenShare?
            <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="p-0.5 transition-transform duration-150"
                style={{
                  transform: (hovered >= star || rating >= star) ? "scale(1.1)" : "scale(1)",
                }}
              >
                <StarIcon
                  size={28}
                  style={{
                    color: (hovered >= star || rating >= star)
                      ? "#f59e0b"
                      : "var(--border)",
                    fill: (hovered >= star || rating >= star)
                      ? "#f59e0b"
                      : "none",
                    transition: "color 0.15s, fill 0.15s",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: "var(--text-primary)" }}
          >
            What did you like most about using the platform?
            <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <textarea
            value={liked}
            onChange={(e) => setLiked(e.target.value)}
            placeholder="Tell us about your experience..."
            rows={3}
            className="w-full mt-2 p-3 rounded-xl border text-sm resize-none outline-none transition-colors duration-200"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          />
        </div>

        <div>
          <label
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: "var(--text-primary)" }}
          >
            How can we improve your experience?
            <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <textarea
            value={improve}
            onChange={(e) => setImprove(e.target.value)}
            placeholder="What should we change or add..."
            rows={3}
            className="w-full mt-2 p-3 rounded-xl border text-sm resize-none outline-none transition-colors duration-200"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          />
        </div>

        <div>
          <label
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: "var(--text-primary)" }}
          >
            Would you recommend us to a friend?
            <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <div className="flex flex-col gap-2 mt-2">
            {recommendations.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRecommend(opt.label)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm text-left transition-all duration-200"
                style={{
                  background: recommend === opt.label ? "var(--bg-elevated)" : "var(--bg-card)",
                  borderColor: recommend === opt.label ? "var(--accent)" : "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0"
                  style={{
                    background: recommend === opt.label ? "var(--accent)" : "var(--bg-elevated)",
                    color: recommend === opt.label ? "#ffffff" : "var(--text-muted)",
                  }}
                >
                  {opt.key}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Your email
          </label>
          <div
            className="flex items-center gap-2 mt-2 px-3 py-2.5 rounded-xl border transition-colors duration-200"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: "var(--text-primary)" }}
            />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>@</span>
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
          style={{
            background: "var(--text-primary)",
            color: "var(--bg)",
          }}
        >
          {submitting ? (
            <>
              <LoaderIcon size={14} />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </div>
  );
}
