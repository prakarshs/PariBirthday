import { useState } from 'react';
import { Sound } from '../utils/sound.js';
import './MuteToggle.css';

export default function MuteToggle() {
  const [muted, setMuted] = useState(false);
  const toggle = () => {
    const newVal = !muted;
    Sound.setMuted(newVal);
    setMuted(newVal);
    if (!newVal) Sound.click();
  };
  return (
    <button className="mute-toggle" onClick={toggle} aria-label={muted ? 'unmute' : 'mute'}>
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
