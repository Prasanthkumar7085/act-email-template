import { useRouter } from "@tanstack/react-router";
import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
} from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

/* ─── Particle canvas ─────────────────────────────────────────────────────── */
const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 55;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11,191,174,${p.alpha})`;
        ctx.fill();
      });

      // draw connections
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(11,191,174,${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};

/* ─── Floating label input ────────────────────────────────────────────────── */
interface FloatInputProps {
  id: string;
  name: string;
  type: string;
  value: string;
  label: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  autoComplete?: string;
}

const FloatInput: React.FC<FloatInputProps> = ({
  id,
  name,
  type,
  value,
  label,
  onChange,
  disabled,
  error,
  icon,
  suffix,
  autoComplete,
}) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div style={{ position: "relative", marginBottom: 0 }}>
      <div
        style={{
          position: "relative",
          borderRadius: 14,
          background: error
            ? "rgba(255,59,59,0.06)"
            : focused
              ? "rgba(11,191,174,0.05)"
              : "rgba(255,255,255,0.07)",
          border: `1.5px solid ${
            error
              ? "rgba(248,113,113,0.8)"
              : focused
                ? "#0bbfae"
                : "rgba(255,255,255,0.12)"
          }`,
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: focused
            ? "0 0 0 4px rgba(11,191,174,0.12), 0 4px 16px rgba(11,191,174,0.08)"
            : "none",
        }}
      >
        {/* Floating label */}
        <label
          htmlFor={id}
          style={{
            position: "absolute",
            left: 46,
            top: lifted ? 8 : "50%",
            transform: lifted
              ? "translateY(0) scale(0.78)"
              : "translateY(-50%) scale(1)",
            transformOrigin: "left center",
            fontSize: 14,
            fontWeight: 500,
            color: error
              ? "rgba(248,113,113,0.9)"
              : lifted
                ? "#0bbfae"
                : "rgba(255,255,255,0.4)",
            transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </label>

        {/* Left icon */}
        <div
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: error
              ? "rgba(248,113,113,0.8)"
              : focused
                ? "#0bbfae"
                : "rgba(255,255,255,0.3)",
            transition: "color 0.22s",
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
        </div>

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            paddingTop: lifted ? 22 : 14,
            paddingBottom: lifted ? 6 : 14,
            paddingLeft: 46,
            paddingRight: suffix ? 44 : 14,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "rgba(255,255,255,0.92)",
            fontSize: 14,
            fontWeight: 400,
            boxSizing: "border-box",
            opacity: disabled ? 0.5 : 1,
            transition: "padding 0.22s cubic-bezier(0.4,0,0.2,1)",
          }}
        />

        {suffix && (
          <div
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <p
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: "rgba(248,113,113,0.9)",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontWeight: 500,
            animation: "errShake 0.3s ease",
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "rgba(248,113,113,0.9)",
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          {error}
        </p>
      )}
    </div>
  );
};

/* ─── Feature badge ───────────────────────────────────────────────────────── */
const FeatureBadge: React.FC<{
  icon: React.ReactNode;
  text: string;
  delay: number;
}> = ({ icon, text, delay }) => (
  <div
    className="feature-badge"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 16px",
      borderRadius: 12,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(8px)",
      animation: `featureIn 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background:
          "linear-gradient(135deg, rgba(11,191,174,0.25), rgba(6,182,212,0.15))",
        border: "1px solid rgba(11,191,174,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#0bbfae",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <span
      style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}
    >
      {text}
    </span>
  </div>
);

/* ─── Main component ──────────────────────────────────────────────────────── */
const SignIn: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email address is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Minimum 8 characters required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubmitDone(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      router.navigate({ to: "/templates" });
    } catch (error) {
      console.error("Sign in error:", error);
      setErrors({ submit: "Invalid credentials. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes featureIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes orbFloat1 {
          0%,100% { transform: translateY(0)   translateX(0)   scale(1);   }
          33%      { transform: translateY(-22px) translateX(14px) scale(1.04); }
          66%      { transform: translateY(12px)  translateX(-10px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translateY(0)    translateX(0)    scale(1);   }
          33%      { transform: translateY(18px)  translateX(-16px) scale(0.96); }
          66%      { transform: translateY(-14px) translateX(10px) scale(1.03); }
        }
        @keyframes orbFloat3 {
          0%,100% { transform: translateY(0)   scale(1);   }
          50%      { transform: translateY(-18px) scale(1.06); }
        }
        @keyframes shimmerLine {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0   rgba(11,191,174,0.4); }
          70%  { box-shadow: 0 0 0 14px rgba(11,191,174,0);   }
          100% { box-shadow: 0 0 0 0   rgba(11,191,174,0);   }
        }
        @keyframes spinGlow {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes dotBlink {
          0%,80%,100% { opacity: 0.15; transform: scale(0.85); }
          40%          { opacity: 1;    transform: scale(1.1);  }
        }
        @keyframes successScale {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes errShake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-4px); }
          75%      { transform: translateX(4px); }
        }
        @keyframes badgePulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        @keyframes lineExpand {
          from { width: 0; opacity: 0; }
          to   { width: 40px; opacity: 1; }
        }

        .signin-root {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          animation: fadeIn 0.35s ease both;
        }

        .left-panel-content {
          animation: fadeSlideUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }

        .sign-in-card {
          animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both;
        }

        .orb-1 { animation: orbFloat1 9s ease-in-out infinite; }
        .orb-2 { animation: orbFloat2 11s ease-in-out infinite; }
        .orb-3 { animation: orbFloat3 7s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(
            110deg,
            #0bbfae 0%,
            #06b6d4 25%,
            #a5f3fc 50%,
            #06b6d4 75%,
            #0bbfae 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerLine 3.5s linear infinite;
        }

        .gradient-heading {
          background: linear-gradient(135deg, #0bbfae 0%, #06b6d4 50%, #38bdf8 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 5s ease infinite;
        }

        .submit-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(11,191,174,0.5), 0 4px 16px rgba(10,123,116,0.35) !important;
        }
        .submit-btn:not(:disabled):active {
          transform: translateY(0) scale(0.985);
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s ease;
        }
        .submit-btn:not(:disabled):hover::before {
          left: 100%;
        }

        .feature-badge {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .feature-badge:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(11,191,174,0.08);
        }

        .logo-mark {
          animation: pulseRing 3s ease-out infinite;
        }

        .dot-1 { animation: dotBlink 1.4s ease-in-out 0s infinite; }
        .dot-2 { animation: dotBlink 1.4s ease-in-out 0.2s infinite; }
        .dot-3 { animation: dotBlink 1.4s ease-in-out 0.4s infinite; }

        .success-icon { animation: successScale 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

        .badge-live {
          animation: badgePulse 2s ease-in-out infinite;
        }

        .line-accent {
          animation: lineExpand 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s both;
        }

        .eye-btn {
          transition: color 0.15s, transform 0.15s;
        }
        .eye-btn:hover {
          color: #0bbfae !important;
          transform: scale(1.1);
        }

        .forgot-btn {
          transition: color 0.15s, opacity 0.15s;
        }
        .forgot-btn:hover {
          color: #38bdf8 !important;
          opacity: 1;
        }

        .signup-btn {
          transition: color 0.15s;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .signup-btn:hover {
          color: #38bdf8 !important;
        }
      `}</style>

      <div
        className="signin-root"
        style={{
          minHeight: "100vh",
          display: "flex",
          background:
            "linear-gradient(145deg, #050e0d 0%, #071a18 40%, #040d0c 100%)",
        }}
      >
        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div
          className="hidden lg:flex"
          style={{
            width: "58%",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(160deg, rgba(11,191,174,0.07) 0%, transparent 55%)",
          }}
        >
          {/* Particle network */}
          <ParticleCanvas />

          {/* Ambient blobs */}
          <div
            className="orb-1"
            style={{
              position: "absolute",
              top: "10%",
              left: "8%",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(11,191,174,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            className="orb-2"
            style={{
              position: "absolute",
              bottom: "12%",
              right: "6%",
              width: 360,
              height: 360,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            className="orb-3"
            style={{
              position: "absolute",
              top: "50%",
              left: "48%",
              transform: "translate(-50%,-50%)",
              width: 480,
              height: 480,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(11,191,174,0.06) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Subtle grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.04,
              backgroundImage:
                "radial-gradient(circle, rgba(11,191,174,1) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              pointerEvents: "none",
            }}
          />

          {/* Content */}
          <div
            className="left-panel-content"
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "44px 52px",
              width: "100%",
              opacity: mounted ? 1 : 0,
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                className="logo-mark"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #0bbfae, #0a7b74)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 24px rgba(11,191,174,0.45)",
                }}
              >
                <Mail style={{ width: 20, height: 20, color: "white" }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.95)",
                    letterSpacing: "-0.4px",
                  }}
                >
                  Email Builder
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 500,
                    color: "rgba(11,191,174,0.7)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Pro Platform
                </div>
              </div>
            </div>

            {/* Hero */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingTop: 40,
                paddingBottom: 40,
              }}
            >
              {/* Live badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 100,
                  marginBottom: 28,
                  width: "fit-content",
                  background: "rgba(11,191,174,0.1)",
                  border: "1px solid rgba(11,191,174,0.25)",
                }}
              >
                <span
                  className="badge-live"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#0bbfae",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#0bbfae",
                    letterSpacing: "0.05em",
                  }}
                >
                  Drag & Drop Editor — Now Live
                </span>
              </div>

              {/* Heading */}
              <h1
                style={{
                  fontSize: "clamp(32px, 3.5vw, 48px)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-1.5px",
                  color: "rgba(255,255,255,0.97)",
                  marginBottom: 8,
                }}
              >
                Build stunning
              </h1>
              <h1
                style={{
                  fontSize: "clamp(32px, 3.5vw, 48px)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-1.5px",
                  marginBottom: 20,
                }}
              >
                <span className="gradient-heading">emails, effortlessly.</span>
              </h1>

              {/* Accent line */}
              <div
                className="line-accent"
                style={{
                  height: 3,
                  borderRadius: 99,
                  background:
                    "linear-gradient(90deg, #0bbfae, #06b6d4, transparent)",
                  marginBottom: 24,
                }}
              />

              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.7,
                  marginBottom: 40,
                  fontWeight: 400,
                }}
              >
                Design pixel-perfect, responsive email templates with our
                intuitive builder. Zero coding required — just pure creativity.
              </p>

              {/* Feature list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  maxWidth: 380,
                }}
              >
                <FeatureBadge
                  icon={<Zap style={{ width: 15, height: 15 }} />}
                  text="Drag & drop building blocks"
                  delay={0.3}
                />
                <FeatureBadge
                  icon={<Sparkles style={{ width: 15, height: 15 }} />}
                  text="50+ professionally designed templates"
                  delay={0.45}
                />
                <FeatureBadge
                  icon={<Shield style={{ width: 15, height: 15 }} />}
                  text="One-click HTML & MJML export"
                  delay={0.6}
                />
              </div>
            </div>

            {/* Footer stats */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {[
                { num: "12k+", label: "Users" },
                { num: "50+", label: "Templates" },
                { num: "99.9%", label: "Uptime" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.9)",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 500,
                      color: "rgba(11,191,174,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.2)",
                  fontWeight: 400,
                }}
              >
                Trusted by teams worldwide
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (form) ──────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* background glows */}
          <div
            className="orb-2"
            style={{
              position: "absolute",
              top: "-15%",
              right: "-15%",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(11,191,174,0.14) 0%, transparent 68%)",
              pointerEvents: "none",
            }}
          />
          <div
            className="orb-1"
            style={{
              position: "absolute",
              bottom: "-20%",
              left: "-20%",
              width: 440,
              height: 440,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Card */}
          <div
            className="sign-in-card"
            style={{
              position: "relative",
              zIndex: 10,
              width: "100%",
              maxWidth: 400,
              opacity: mounted ? 1 : 0,
            }}
          >
            {/* Glass card */}
            <div
              style={{
                borderRadius: 24,
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 32px 80px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset, 0 -1px 0 rgba(0,0,0,0.2) inset",
                padding: "36px 32px 32px",
              }}
            >
              {/* Card header */}
              <div style={{ marginBottom: 32 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #0bbfae, #0a7b74)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    boxShadow: "0 8px 28px rgba(11,191,174,0.4)",
                  }}
                >
                  <Lock style={{ width: 22, height: 22, color: "white" }} />
                </div>

                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.96)",
                    letterSpacing: "-0.8px",
                    marginBottom: 6,
                  }}
                >
                  Welcome back
                </h2>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "rgba(255,255,255,0.38)",
                    fontWeight: 400,
                    lineHeight: 1.5,
                  }}
                >
                  Sign in to continue to your workspace
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                noValidate
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FloatInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  label="Email address"
                  onChange={handleChange}
                  disabled={isSubmitting}
                  error={errors.email}
                  icon={<Mail style={{ width: 16, height: 16 }} />}
                  autoComplete="email"
                />

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: 6,
                    }}
                  >
                    <button
                      type="button"
                      className="forgot-btn"
                      onClick={() => alert("Password reset coming soon!")}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "rgba(11,191,174,0.7)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        opacity: 0.85,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <FloatInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    label="Password"
                    onChange={handleChange}
                    disabled={isSubmitting}
                    error={errors.password}
                    autoComplete="current-password"
                    icon={<Lock style={{ width: 16, height: 16 }} />}
                    suffix={
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        style={{
                          color: "rgba(255,255,255,0.35)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff style={{ width: 16, height: 16 }} />
                        ) : (
                          <Eye style={{ width: 16, height: 16 }} />
                        )}
                      </button>
                    }
                  />
                </div>

                {/* Submit */}
                <div style={{ marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={isSubmitting || submitDone}
                    className="submit-btn"
                    style={{
                      width: "100%",
                      padding: "14px 24px",
                      borderRadius: 14,
                      border: "none",
                      cursor:
                        isSubmitting || submitDone ? "not-allowed" : "pointer",
                      background:
                        isSubmitting || submitDone
                          ? "rgba(255,255,255,0.08)"
                          : "linear-gradient(135deg, #0bbfae 0%, #0a9e94 50%, #0891b2 100%)",
                      backgroundSize: "200% 200%",
                      color:
                        isSubmitting || submitDone
                          ? "rgba(255,255,255,0.4)"
                          : "white",
                      fontSize: 14.5,
                      fontWeight: 700,
                      letterSpacing: "-0.2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow:
                        isSubmitting || submitDone
                          ? "none"
                          : "0 6px 24px rgba(11,191,174,0.38), 0 2px 8px rgba(10,123,116,0.25)",
                      transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          style={{
                            width: 17,
                            height: 17,
                            animation: "spinGlow 0.9s linear infinite",
                          }}
                        />
                        <span>Signing in</span>
                        <span
                          style={{
                            display: "flex",
                            gap: 3,
                            alignItems: "center",
                          }}
                        >
                          <span
                            className="dot-1"
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.5)",
                              display: "inline-block",
                            }}
                          />
                          <span
                            className="dot-2"
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.5)",
                              display: "inline-block",
                            }}
                          />
                          <span
                            className="dot-3"
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.5)",
                              display: "inline-block",
                            }}
                          />
                        </span>
                      </>
                    ) : submitDone ? (
                      <>
                        <span className="success-icon" style={{ fontSize: 17 }}>
                          ✓
                        </span>
                        <span>Redirecting…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight style={{ width: 17, height: 17 }} />
                      </>
                    )}
                  </button>
                </div>

                {/* Submit error */}
                {errors.submit && (
                  <div
                    style={{
                      padding: "11px 14px",
                      borderRadius: 12,
                      background: "rgba(248,113,113,0.08)",
                      border: "1px solid rgba(248,113,113,0.25)",
                      animation: "errShake 0.3s ease",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "rgba(248,113,113,0.9)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "rgba(248,113,113,0.9)",
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      />
                      {errors.submit}
                    </p>
                  </div>
                )}
              </form>

              {/* Divider */}
              <div
                style={{
                  marginTop: 28,
                  paddingTop: 22,
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.3)",
                    fontWeight: 400,
                  }}
                >
                  Don't have an account?{" "}
                  <button
                    className="signup-btn"
                    style={{ fontSize: 13, fontWeight: 700, color: "#0bbfae" }}
                    onClick={() => alert("Sign up coming soon!")}
                  >
                    Create one free
                  </button>
                </p>
              </div>
            </div>

            {/* Bottom caption */}
            <p
              style={{
                marginTop: 20,
                textAlign: "center",
                fontSize: 11.5,
                color: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                fontWeight: 400,
              }}
            >
              <Shield style={{ width: 11, height: 11 }} />
              256-bit SSL encrypted · SOC 2 compliant
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
