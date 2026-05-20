import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sound } from "../utils/sound.js";
import { feedback } from "../utils/feedback.js";
import { useConfetti } from "../hooks/useConfetti.js";
import "./Level.css";

const HINTS = [
  "gol banana hai... aloo nahi 😭",

  "Michelangelo ya mashed aloo? dekhte hain 👀",

  "andar ka compass activate karo 📐",

  "haath stable rakho, desh dekh raha hai 👁️",

  "geometry aaj tumhe judge karegi 😔",

  "bhagwan ke naam pe ek circle de do 🙏",

  "confidence full rakho, accuracy baad mein dekh lenge 😌",

  "ekdum gol chahiye... golgappa nahi 😭",

  "JEE se pehle circle test 😭",

  "seedha haath, saaf niyat, gol result ✨",

  "perfect hua toh flex karenge 😤",

  "haath kaanp gaya toh humne kuch nahi dekha 👀",

  "yehi asli entrance exam hai 📐",
];

/**
 * Draw a circle. Score = how close points are to a perfect circle
 * fit to their bounding centroid.
 */
export default function Level1Circle({ onComplete }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const pointsRef = useRef([]);
  const drawingRef = useRef(false);
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState("");
  const [phase, setPhase] = useState("idle"); // idle, drawing, done
  const [hint] = useState(
    () => HINTS[Math.floor(Math.random() * HINTS.length)],
  );
  const burst = useConfetti();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawGuides();
    };

    const drawGuides = () => {
      const ctx = canvas.getContext("2d");
      const r = wrap.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      // crosshair
      const cx = r.width / 2;
      const cy = r.height / 2;
      ctx.strokeStyle = "rgba(106,76,147,0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy);
      ctx.lineTo(cx + 14, cy);
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx, cy + 14);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "var(--plum)";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#6A4C93";
      ctx.fill();
    };

    resize();
    window.addEventListener("resize", resize);

    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    };

    const start = (e) => {
      e.preventDefault();
      if (phase === "done") return;
      drawingRef.current = true;
      pointsRef.current = [];
      const p = getPos(e);
      pointsRef.current.push(p);
      setPhase("drawing");
      Sound.unlock();
      const ctx = canvas.getContext("2d");
      const r = wrap.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      drawGuides();
      ctx.strokeStyle = "#6A4C93";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };

    const move = (e) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      const p = getPos(e);
      const last = pointsRef.current[pointsRef.current.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < 2) return;
      pointsRef.current.push(p);
      const ctx = canvas.getContext("2d");
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    const end = () => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      if (pointsRef.current.length < 20) {
        setPhase("idle");
        pointsRef.current = [];
        drawGuides();
        return;
      }
      finishDrawing();
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    canvas.addEventListener("touchcancel", end);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", end);
      canvas.removeEventListener("touchcancel", end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishDrawing = () => {
    const pts = pointsRef.current;
    if (pts.length < 20) return;

    let sx = 0;
    let sy = 0;

    for (const p of pts) {
      sx += p.x;
      sy += p.y;
    }

    const cx = sx / pts.length;
    const cy = sy / pts.length;

    const dists = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));

    const avgR = dists.reduce((a, b) => a + b, 0) / dists.length;

    if (avgR < 20) return;

    const variance =
      dists.reduce((s, d) => s + (d - avgR) ** 2, 0) / dists.length;

    const stddev = Math.sqrt(variance);

    const ratio = stddev / avgR;

    let s = 100 * (1 - Math.pow(ratio / 0.45, 0.7));

    s = Math.max(0, Math.min(100, s));

    const startEnd = Math.hypot(
      pts[0].x - pts[pts.length - 1].x,
      pts[0].y - pts[pts.length - 1].y,
    );

    const closure = 1 - Math.min(1, startEnd / (2 * avgR));

    s = s * (0.6 + 0.4 * closure);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // draw user's final shape again
    ctx.save();

    ctx.strokeStyle = "#6A4C93";
    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }

    ctx.stroke();

    // ideal circle overlay
    ctx.strokeStyle = "rgba(255,143,184,0.7)";

    ctx.lineWidth = 2;

    ctx.setLineDash([6, 6]);

    ctx.beginPath();

    ctx.arc(cx, cy, avgR, 0, Math.PI * 2);

    ctx.stroke();

    ctx.restore();

    setScore(s);
    setComment(feedback.circle(s));

    setPhase("done");

    Sound.success();

    if (s >= 70) {
      burst(window.innerWidth / 2, window.innerHeight / 2, {
        count: Math.round(20 + s / 4),
        power: 0.9,
      });
    }
  };

  const handleRetry = () => {
    Sound.click();
    pointsRef.current = [];
    setScore(null);
    setComment("");
    setPhase("idle");
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext("2d");
    const r = wrap.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    // re-draw guides
    const cx = r.width / 2;
    const cy = r.height / 2;
    ctx.strokeStyle = "rgba(106,76,147,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy);
    ctx.lineTo(cx + 14, cy);
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx, cy + 14);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#6A4C93";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleNext = () => {
    Sound.click();
    onComplete({ score, comment, stat: "art" });
  };

  return (
    <div className="level">
      <div className="level__header">
        <span className="level__chip">level 1 · Drawing</span>
        <h1 className="level__title">Draw a perfect circle</h1>
        <p className="level__sub">in one smooth stroke ✏️</p>
      </div>

      <div className="level__stage">
        <div ref={wrapRef} className="circle-canvas-wrap">
          <canvas ref={canvasRef} className="circle-canvas" />
          {phase === "idle" && (
            <motion.div
              className="circle-hint hand"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              kahi se bhi start karo · draw around the dot
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {phase === "done" && (
            <motion.div
              key="result"
              className="circle-result"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="circle-score">
                <span className="circle-score__num">{Math.round(score)}</span>
                <span className="circle-score__lbl">%</span>
              </div>
              <p className="feedback-bubble">{comment}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="level__footer">
        {phase === "done" ? (
          <>
            <button className="btn btn--ghost" onClick={handleRetry}>
              retry
            </button>
            <button className="btn" onClick={handleNext}>
              bake this layer →
            </button>
          </>
        ) : (
          <p className="hand level__hint">{hint}</p>
        )}
      </div>
    </div>
  );
}
