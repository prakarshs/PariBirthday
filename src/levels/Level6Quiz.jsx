import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sound } from "../utils/sound.js";
import { feedback } from "../utils/feedback.js";
import { useConfetti } from "../hooks/useConfetti.js";
import "./Level.css";

const QUESTIONS = [
  {
    q: 'How do you say "My name is..."?',
    hint: "introducing yourself",
    options: [
      "わたしのなまえは...",
      "おげんきですか",
      "ありがとう",
      "こんばんは",
    ],
    a: 0,
  },

  {
    q: 'How do you say "Thank you"?',
    hint: "when someone helps you",
    options: ["こんにちは", "ありがとう", "すみません", "さようなら"],
    a: 1,
  },

  {
    q: 'How do you say "Hello"?',
    hint: "daytime greeting",
    options: ["こんばんは", "こんにちは", "おやすみ", "いただきます"],
    a: 1,
  },

  {
    q: 'How do you say "Excuse me / Sorry"?',
    hint: "polite attention getter",
    options: ["すみません", "おいしい", "ねこ", "ありがとう"],
    a: 0,
  },

  {
    q: "What do you say before eating?",
    hint: "anime food scene moment",
    options: ["こんばんは", "おなまえは", "いただきます", "かわいい"],
    a: 2,
  },

  {
    q: 'How do you say "Cute"?',
    hint: "small fluffy things trigger this",
    options: ["こわい", "たかい", "つまらない", "かわいい"],
    a: 3,
  },

  {
    q: 'How do you say "Cat"?',
    hint: "small fluffy animal",
    options: ["いぬ", "ねこ", "さかな", "とり"],
    a: 1,
  },

  {
    q: 'How do you say "Delicious"?',
    hint: "reaction to good biryani 😄",
    options: ["おいしい", "あつい", "さむい", "からい"],
    a: 0,
  },
];

function pickQuestions(n) {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const QUIZ_LENGTH = 6;

export default function Level6Quiz({ onComplete }) {
  const questions = useMemo(() => pickQuestions(QUIZ_LENGTH), []);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [right, setRight] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [done, setDone] = useState(false);
  const burst = useConfetti();

  const q = questions[idx];

  const handleChoose = (i) => {
    if (chosen !== null) return;
    setChosen(i);
    const correct = i === q.a;
    if (correct) {
      Sound.success();
      setRight((r) => r + 1);
      setFeedbackText(feedback.japaneseRight());
    } else {
      Sound.fail();
      setFeedbackText(feedback.japaneseWrong());
    }
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const score = Math.round(
          ((right + (correct ? 1 : 0)) / questions.length) * 100,
        );
        if (score >= 70)
          burst(window.innerWidth / 2, window.innerHeight / 2, { count: 50 });
        setDone(true);
      } else {
        setIdx((x) => x + 1);
        setChosen(null);
        setFeedbackText("");
      }
    }, 1100);
  };

  const finalize = () => {
    Sound.click();
    const score = Math.round((right / questions.length) * 100);
    const c =
      score >= 90
        ? "Senpai ne notice kar liya 🎌✨"
        : score >= 70
          ? "JLPT N5 incoming"
          : score >= 50
            ? "日本人 arc load ho raha hai 😌"
            : score >= 30
              ? "Anime subtitles ne dhokha de diya 😭"
              : "Ramen banana tha, yipee ban gaya🍜😭";
    onComplete({ score, comment: c, stat: "japanese" });
  };

  if (done) {
    const score = Math.round((right / questions.length) * 100);
    return (
      <div className="level">
        <div className="level__header">
          <span className="level__chip">level 6 · Japani</span>
          <h1 className="level__title">クイズ完了 ✨</h1>
        </div>
        <div className="level__stage">
          <motion.div
            className="card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: "center", minWidth: 300 }}
          >
            <div className="circle-score" style={{ justifyContent: "center" }}>
              <span className="circle-score__num">{right}</span>
              <span className="circle-score__lbl">/ {questions.length}</span>
            </div>
            <p className="feedback-bubble" style={{ marginTop: 12 }}>
              {score >= 90
                ? "Senpai ne notice kar liya 🎌✨"
                : score >= 70
                  ? "JLPT N5 incoming 👀"
                  : score >= 50
                    ? "日本人 arc load ho raha hai 😌"
                    : score >= 30
                      ? "Anime subtitles ne dhokha de diya 😭"
                      : "Ramen banana tha, yipee ban gaya 🍜😭"}
            </p>
          </motion.div>
        </div>
        <div className="level__footer">
          <button className="btn" onClick={finalize}>
            final layer →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="level">
      <div className="level__header">
        <span className="level__chip">level 6 · Japani</span>
        <h1 className="level__title">Kya apka joota hai Japani?</h1>
        <div className="quiz-progress">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`mudra-pip ${i < idx ? "mudra-pip--done" : i === idx ? "mudra-pip--done" : ""}`}
              style={{
                background: i <= idx ? "var(--pink)" : "var(--muted)",
                opacity: i <= idx ? 1 : 0.4,
              }}
            />
          ))}
        </div>
      </div>

      <div className="level__stage">
        <div className="quiz-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              className="quiz-question"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="quiz-question__jp">{q.q}</div>
              <div className="quiz-question__hint">{q.hint}</div>
            </motion.div>
          </AnimatePresence>

          <div className="quiz-options">
            {q.options.map((opt, i) => {
              let cls = "quiz-option";
              if (chosen !== null) {
                if (i === q.a) cls += " quiz-option--right";
                else if (i === chosen) cls += " quiz-option--wrong";
              }
              return (
                <motion.button
                  key={i}
                  className={cls}
                  onClick={() => handleChoose(i)}
                  disabled={chosen !== null}
                  whileTap={{ scale: 0.97 }}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>

          <p className="feedback-bubble" style={{ minHeight: 56 }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={feedbackText || "wait"}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -6, opacity: 0 }}
              >
                {feedbackText || "pick one ⬆️"}
              </motion.span>
            </AnimatePresence>
          </p>
        </div>
      </div>

      <div className="level__footer">
        <p className="hand level__hint">
          {idx + 1} / {questions.length}
        </p>
      </div>
    </div>
  );
}
