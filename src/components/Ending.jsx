import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cake from './Cake.jsx';
import { Sound } from '../utils/sound.js';
import { useConfetti } from '../hooks/useConfetti.js';
import './Ending.css';

const FINAL_LINES = [
  '16 years completed.',
  "you're talented.",
  "you're weird.",
  "you're kind.",
  "you're pretty awesome.",
  'happy 16th birthday ❤️',
  'meri pyaari Pari'
];

const STAT_DEFS = [
  { key: 'creativity', label: 'Creativity', icon: '🎨' },
  { key: 'chaos', label: 'Chaos Energy', icon: '🌀' },
  { key: 'japanese', label: 'Japanese Powers', icon: '🎌' },
  { key: 'biryani', label: 'Biryani Expertise', icon: '🍛' },
  { key: 'art', label: 'Art Skill', icon: '✏️' },
  { key: 'music', label: 'Music Aura', icon: '🎶' }
];

// Each filter has BOTH a CSS string (for live preview) AND a JS pixel function
// (for the captured photo, since mobile browsers ignore ctx.filter)
const FILTERS = [
  {
    key: 'none', label: 'Au naturel', emoji: '✨',
    css: 'none',
    apply: null
  },
  {
    key: 'dreamy', label: 'Dreamy', emoji: '☁️',
    css: 'saturate(1.3) contrast(0.95) brightness(1.1)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        // Brightness *1.1, contrast *0.95, saturate *1.3
        let r = d[i], g = d[i+1], b = d[i+2];
        r *= 1.1; g *= 1.1; b *= 1.1;
        r = (r - 128) * 0.95 + 128;
        g = (g - 128) * 0.95 + 128;
        b = (b - 128) * 0.95 + 128;
        const gray = 0.3*r + 0.59*g + 0.11*b;
        r = gray + (r - gray) * 1.3;
        g = gray + (g - gray) * 1.3;
        b = gray + (b - gray) * 1.3;
        d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b);
      }
    }
  },
  {
    key: 'vintage', label: 'Vintage', emoji: '📸',
    css: 'sepia(0.55) contrast(1.05) brightness(1.05) saturate(1.2)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i+1], b = d[i+2];
        // Sepia 55%
        const tr = 0.393*r + 0.769*g + 0.189*b;
        const tg = 0.349*r + 0.686*g + 0.168*b;
        const tb = 0.272*r + 0.534*g + 0.131*b;
        r = r * 0.45 + tr * 0.55;
        g = g * 0.45 + tg * 0.55;
        b = b * 0.45 + tb * 0.55;
        // Brightness 1.05
        r *= 1.05; g *= 1.05; b *= 1.05;
        // Contrast 1.05
        r = (r - 128) * 1.05 + 128;
        g = (g - 128) * 1.05 + 128;
        b = (b - 128) * 1.05 + 128;
        d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b);
      }
    }
  },
  {
    key: 'noir', label: 'Noir', emoji: '🎬',
    css: 'grayscale(1) contrast(1.3) brightness(0.95)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.3*d[i] + 0.59*d[i+1] + 0.11*d[i+2];
        let v = gray * 0.95;
        v = (v - 128) * 1.3 + 128;
        d[i] = d[i+1] = d[i+2] = clamp(v);
      }
    }
  },
  {
    key: 'sunset', label: 'Sunset', emoji: '🌅',
    css: 'sepia(0.3) saturate(1.6) hue-rotate(-15deg) brightness(1.1)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i+1], b = d[i+2];
        // Light sepia 30%
        const tr = 0.393*r + 0.769*g + 0.189*b;
        const tg = 0.349*r + 0.686*g + 0.168*b;
        const tb = 0.272*r + 0.534*g + 0.131*b;
        r = r * 0.7 + tr * 0.3;
        g = g * 0.7 + tg * 0.3;
        b = b * 0.7 + tb * 0.3;
        // Warm shift (approximating hue-rotate(-15deg))
        r *= 1.15; b *= 0.9;
        // Brightness 1.1
        r *= 1.1; g *= 1.1; b *= 1.1;
        // Saturate 1.6
        const gray = 0.3*r + 0.59*g + 0.11*b;
        r = gray + (r - gray) * 1.6;
        g = gray + (g - gray) * 1.6;
        b = gray + (b - gray) * 1.6;
        d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b);
      }
    }
  },
  {
    key: 'kawaii', label: 'Kawaii', emoji: '🌸',
    css: 'saturate(1.4) hue-rotate(330deg) brightness(1.15) contrast(0.95)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i+1], b = d[i+2];
        // Pink shift (approximating hue-rotate(330deg) which is -30deg)
        r = r * 1.1 + 10;
        b = b * 1.05 + 5;
        // Brightness 1.15
        r *= 1.15; g *= 1.15; b *= 1.15;
        // Contrast 0.95
        r = (r - 128) * 0.95 + 128;
        g = (g - 128) * 0.95 + 128;
        b = (b - 128) * 0.95 + 128;
        // Saturate 1.4
        const gray = 0.3*r + 0.59*g + 0.11*b;
        r = gray + (r - gray) * 1.4;
        g = gray + (g - gray) * 1.4;
        b = gray + (b - gray) * 1.4;
        d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b);
      }
    }
  },
  {
    key: 'cyber', label: 'Cyber', emoji: '🌀',
    css: 'saturate(2) hue-rotate(180deg) contrast(1.2)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i+1], b = d[i+2];
        // Hue rotate 180deg = swap warm/cool (approximate by swapping R<->B emphasis)
        const newR = b;
        const newB = r;
        r = newR; b = newB;
        // Contrast 1.2
        r = (r - 128) * 1.2 + 128;
        g = (g - 128) * 1.2 + 128;
        b = (b - 128) * 1.2 + 128;
        // Saturate 2
        const gray = 0.3*r + 0.59*g + 0.11*b;
        r = gray + (r - gray) * 2;
        g = gray + (g - gray) * 2;
        b = gray + (b - gray) * 2;
        d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b);
      }
    }
  },
  {
    key: 'cursed', label: 'Cursed', emoji: '👁️',
    css: 'hue-rotate(90deg) saturate(3) contrast(1.4) invert(0.1)',
    apply: (d) => {
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i+1], b = d[i+2];
        // Hue rotate 90deg approx: R->G, G->B, B->R cycle
        const nr = b, ng = r, nb = g;
        r = nr; g = ng; b = nb;
        // Invert 10%
        r = r * 0.9 + (255 - r) * 0.1;
        g = g * 0.9 + (255 - g) * 0.1;
        b = b * 0.9 + (255 - b) * 0.1;
        // Contrast 1.4
        r = (r - 128) * 1.4 + 128;
        g = (g - 128) * 1.4 + 128;
        b = (b - 128) * 1.4 + 128;
        // Saturate 3
        const gray = 0.3*r + 0.59*g + 0.11*b;
        r = gray + (r - gray) * 3;
        g = gray + (g - gray) * 3;
        b = gray + (b - gray) * 3;
        d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b);
      }
    }
  }
];

const clamp = (v) => Math.max(0, Math.min(255, v));

export default function Ending({ scores }) {
  const [phase, setPhase] = useState('lighting');
  const [lineIdx, setLineIdx] = useState(0);

  const [boothStep, setBoothStep] = useState('camera');
  const [filter, setFilter] = useState(FILTERS[0]);
  const [countdown, setCountdown] = useState(3);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const burst = useConfetti();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const postcardRef = useRef(null);

  useEffect(() => {
    Sound.startEndingMusic();
    Sound.layerAdd();

    const fanfare1 = setTimeout(() => Sound.fanfare(), 400);
    const burst1 = setTimeout(() => {
      burst(window.innerWidth / 2, window.innerHeight * 0.45, { count: 80, power: 1.2 });
      Sound.fanfare();
    }, 900);

    const scoreTransition = setTimeout(() => setPhase('scorecard'), 3200);

    return () => {
      clearTimeout(fanfare1);
      clearTimeout(burst1);
      clearTimeout(scoreTransition);
    };
  }, []);

  useEffect(() => {
    return () => {
      Sound.stopEndingMusic();
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'message') return;
    if (lineIdx >= FINAL_LINES.length) return;

    const t = setTimeout(() => {
      Sound.pop();

      if (lineIdx === FINAL_LINES.length - 1) {
        Sound.fanfare();
        setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2, { count: 80, power: 1.3 }), 200);
        setTimeout(() => burst(window.innerWidth * 0.25, window.innerHeight * 0.5, { count: 40, power: 1 }), 700);
        setTimeout(() => burst(window.innerWidth * 0.75, window.innerHeight * 0.5, { count: 40, power: 1 }), 1100);
        setTimeout(() => setPhase('booth'), 3500);
      }

      setLineIdx((i) => i + 1);
    }, lineIdx === 0 ? 600 : 1500);

    return () => clearTimeout(t);
  }, [phase, lineIdx]);

  // Start camera when entering booth (and re-attach on retake)
  useEffect(() => {
    if (phase === 'booth' && boothStep === 'camera') {
      // If we still have a live stream, just re-attach it (retake case)
      if (streamRef.current && videoRef.current) {
        attachStream();
      } else {
        startCamera();
      }
    }
    return () => {
      if (phase !== 'booth') stopCamera();
    };
  }, [phase, boothStep]);

  const attachStream = async () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    video.srcObject = streamRef.current;

    // iOS Safari needs explicit play() after re-attaching
    try {
      await video.play();
    } catch (err) {
      console.warn('video.play() rejected:', err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (err) {
          console.warn('video.play() rejected:', err);
        }
      }
      setCameraError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
          err.name === 'NotAllowedError'
              ? 'Camera access denied. You can still download the keepsake without a photo!'
              : 'Camera not available. You can still download the keepsake!'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCountdown = () => {
    Sound.click();
    setBoothStep('countdown');
    setCountdown(3);
  };

  useEffect(() => {
    if (boothStep !== 'countdown') return;
    if (countdown <= 0) {
      capturePhoto();
      return;
    }
    Sound.pop();
    const t = setTimeout(() => setCountdown((c) => c - 1), 800);
    return () => clearTimeout(t);
  }, [boothStep, countdown]);

  const doCapture = (video) => {
    const size = 480;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const minDim = Math.min(vw, vh);
    const sx = (vw - minDim) / 2;
    const sy = (vh - minDim) / 2;

    // Mirror + draw video
    ctx.save();
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);
    ctx.restore();

    // Apply JS-based pixel filter (works on all browsers including mobile)
    if (filter.apply) {
      try {
        const imageData = ctx.getImageData(0, 0, size, size);
        filter.apply(imageData.data);
        ctx.putImageData(imageData, 0, 0);
      } catch (err) {
        console.warn('Filter application failed:', err);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    console.log('Captured photo size:', dataUrl.length, 'bytes');

    setPhotoDataUrl(dataUrl);
    Sound.fanfare();
    burst(window.innerWidth / 2, window.innerHeight / 2, { count: 50, power: 1 });
    setBoothStep('postcard');
    // Note: we DON'T stopCamera here, so retake can reuse the stream
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video) {
      console.warn('No video element ref');
      setBoothStep('postcard');
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      console.warn('Video not ready, attempting recovery. videoWidth:', video.videoWidth);
      if (streamRef.current && !video.srcObject) {
        video.srcObject = streamRef.current;
        video.play().catch(() => {});
      }
      setTimeout(() => {
        const v = videoRef.current;
        if (v && v.videoWidth && v.videoHeight) {
          doCapture(v);
        } else {
          console.error('Video still not ready, going to postcard without photo');
          setBoothStep('postcard');
        }
      }, 400);
      return;
    }

    doCapture(video);
  };

  const skipPhoto = () => {
    Sound.click();
    stopCamera();
    setPhotoDataUrl(null);
    setBoothStep('postcard');
  };

  const retakePhoto = () => {
    Sound.click();
    setPhotoDataUrl(null);
    setBoothStep('camera');
  };

  const handleDownload = async () => {
    if (!postcardRef.current) return;
    setDownloading(true);
    Sound.click();

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(postcardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = 'pari-16th-birthday.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      Sound.fanfare();
      burst(window.innerWidth / 2, window.innerHeight / 2, { count: 60, power: 1.1 });
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  // -------- RENDER --------

  if (phase === 'lighting') {
    return (
        <motion.div className="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <motion.div
              className="ending__cake-stage"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Cake layers={6} lit={true} />
          </motion.div>

          <motion.p
              className="ending__lighting-text hand"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
          >
            ✨ make a wish ✨
          </motion.p>
        </motion.div>
    );
  }

  if (phase === 'scorecard') {
    return (
        <motion.div className="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="ending__scorecard-wrap">
            <motion.div
                className="ending__cake-mini"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
              <Cake layers={6} lit={true} compact />
            </motion.div>

            <motion.div
                className="card scorecard"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="scorecard__head">
                <p className="hand scorecard__hand">official stats of</p>
                <h2 className="scorecard__title">a 16-year-old legend</h2>
              </div>

              <ul className="scorecard__list">
                {STAT_DEFS.map((st, i) => {
                  const val = scores[st.key] ?? 50;
                  return (
                      <motion.li
                          key={st.key}
                          className="scorecard__row"
                          initial={{ x: -16, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      >
                        <span className="scorecard__icon">{st.icon}</span>
                        <span className="scorecard__label">{st.label}</span>
                        <span className="scorecard__bar">
                      <motion.span
                          className="scorecard__fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.max(8, val))}%` }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </span>
                        <span className="scorecard__num">{Math.round(val)}</span>
                      </motion.li>
                  );
                })}
              </ul>

              <motion.button
                  className="btn"
                  onClick={() => {
                    Sound.click();
                    setPhase('message');
                    setLineIdx(0);
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
              >
                one more thing →
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
    );
  }

  if (phase === 'message') {
    return (
        <motion.div
            className="ending ending--message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
          <motion.div
              className="ending__cake-bg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.35 }}
              transition={{ duration: 1 }}
          >
            <Cake layers={6} lit={true} />
          </motion.div>

          <div className="ending__lines">
            {FINAL_LINES.slice(0, lineIdx).map((line, i) => {
              const isFinal = i === FINAL_LINES.length - 1;
              return (
                  <motion.p
                      key={i}
                      className={`ending__line ${isFinal ? 'ending__line--final' : ''}`}
                      initial={{ y: 16, opacity: 0, filter: 'blur(6px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {line}
                  </motion.p>
              );
            })}
          </div>
        </motion.div>
    );
  }

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const isCameraStage = boothStep === 'camera' || boothStep === 'countdown';

  return (
      <motion.div
          className="ending ending--booth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {isCameraStage && (
              <motion.div
                  key="camera-stage"
                  className="booth"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
              >
                {boothStep === 'camera' && (
                    <p className="hand booth__tag">📸 say cheese!</p>
                )}

                <div className="booth__camera">
                  {cameraError ? (
                      <div className="booth__error">
                        <p>{cameraError}</p>
                      </div>
                  ) : (
                      <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="booth__video"
                          style={{ filter: filter.css }}
                      />
                  )}
                  <div className="booth__frame-deco">
                    <span>✦</span><span>✦</span><span>✦</span><span>✦</span>
                  </div>

                  {boothStep === 'countdown' && (
                      <motion.div
                          key={countdown}
                          className="booth__countdown"
                          initial={{ scale: 2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                      >
                        {countdown > 0 ? countdown : '✨'}
                      </motion.div>
                  )}
                </div>

                {boothStep === 'camera' && (
                    <>
                      <div className="booth__filters">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                className={`booth__filter ${filter.key === f.key ? 'booth__filter--active' : ''}`}
                                onClick={() => {
                                  Sound.pop();
                                  setFilter(f);
                                }}
                            >
                              <span className="booth__filter-emoji">{f.emoji}</span>
                              <span className="booth__filter-label">{f.label}</span>
                            </button>
                        ))}
                      </div>

                      <div className="booth__actions">
                        {!cameraError && (
                            <button className="btn" onClick={startCountdown}>
                              📸 snap photo
                            </button>
                        )}
                        <button className="btn btn--ghost" onClick={skipPhoto}>
                          skip photo
                        </button>
                      </div>
                    </>
                )}
              </motion.div>
          )}

          {boothStep === 'postcard' && (
              <motion.div
                  key="postcard"
                  className="booth"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
              >
                <p className="hand booth__tag">your keepsake ✨</p>

                <motion.div
                    ref={postcardRef}
                    className="postcard"
                    initial={{ scale: 0.85, opacity: 0, rotate: -3 }}
                    animate={{ scale: 1, opacity: 1, rotate: -1.5 }}
                    transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <div className="postcard__header">
                    <p className="postcard__date">{today}</p>
                    <h2 className="postcard__title">Pari's sweet sixteen ✨</h2>
                    <p className="postcard__sub hand">a certified legend</p>
                  </div>

                  <div className="postcard__photo-wrap">
                    {photoDataUrl ? (
                        <img src={photoDataUrl} alt="Birthday selfie" className="postcard__photo" />
                    ) : (
                        <div className="postcard__photo postcard__photo--placeholder">
                          <Cake layers={6} lit={true} compact />
                        </div>
                    )}
                    <div className="postcard__tape postcard__tape--tl" />
                    <div className="postcard__tape postcard__tape--br" />
                  </div>

                  <div className="postcard__stats">
                    <p className="postcard__stats-head hand">aapke game stats</p>
                    <ul className="postcard__stat-list">
                      {STAT_DEFS.map((st) => {
                        const val = scores[st.key] ?? 50;
                        return (
                            <li key={st.key} className="postcard__stat">
                              <span className="postcard__stat-icon">{st.icon}</span>
                              <span className="postcard__stat-label">{st.label}</span>
                              <span className="postcard__stat-bar">
                          <span
                              className="postcard__stat-fill"
                              style={{ width: `${Math.min(100, Math.max(8, val))}%` }}
                          />
                        </span>
                              <span className="postcard__stat-num">{Math.round(val)}</span>
                            </li>
                        );
                      })}
                    </ul>
                  </div>

                  <p className="postcard__quote hand">Happiest Birthday Pari !!!</p>
                </motion.div>

                <div className="booth__actions">
                  <button className="btn" onClick={handleDownload} disabled={downloading}>
                    {downloading ? 'saving...' : 'save postcard'}
                  </button>
                  <button className="btn btn--ghost" onClick={retakePhoto}>
                    📸 retake photo
                  </button>
                  <button className="btn btn--ghost" onClick={() => window.location.reload()}>
                    play again 🎂
                  </button>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
}