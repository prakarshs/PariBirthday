import { useEffect, useReducer, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sound } from "../utils/sound.js";
import { feedback } from "../utils/feedback.js";
import { useConfetti } from "../hooks/useConfetti.js";
import "./Level.css";

/**
 * Biryani Shop Simulator.
 * Customers arrive with a randomized order made up of 2–3 toppings.
 * Player taps the right toppings, then serves. Patience drains over time.
 * Earn enough rupees before the timer runs out.
 */

const ITEMS = [
  {
    id: "biryani",
    label: "Muradabadi Biryani",
    icon: "🍛",
    color: "#D08B4E",
  },

  {
    id: "pizza",
    label: "Pizza Slice",
    icon: "🍕",
    color: "#E85A4F",
  },

  {
    id: "maggi",
    label: "Cheesy Maggi",
    icon: "🍜",
    color: "#FFD56B",
  },

  {
    id: "icecream",
    label: "Ice Cream",
    icon: "🍨",
    color: "#FF8FB8",
  },

  {
    id: "momo",
    label: "Momos",
    icon: "🥟",
    color: "#F2C6A0",
  },

  {
    id: "coke",
    label: "Coke",
    icon: "🥤",
    color: "#E85A4F",
  },
];

const FACES = ["😄", "🥺", "🤩", "😋", "😤", "🤤", "😎", "🙃"];
const BG_COLORS = ["#FFD0E1", "#FFE8B0", "#E5D7FF", "#C8E8F8", "#FFCBA4"];

const GOAL_RUPEES = 1500;
const TIME_LIMIT = 60; // seconds
const MAX_CUSTOMERS = 4;

let nextCustomerId = 1;

function makeCustomer() {
  const count = 2 + Math.floor(Math.random() * 2);
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
  const order = shuffled.slice(0, count).map((i) => i.id);
  return {
    id: nextCustomerId++,
    order,
    patience: 14 + Math.random() * 8, // seconds
    maxPatience: 18,
    face: FACES[Math.floor(Math.random() * FACES.length)],
    bg: BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "spawn":
      if (state.customers.length >= MAX_CUSTOMERS) return state;
      return { ...state, customers: [...state.customers, makeCustomer()] };
    case "tick": {
      const dt = action.dt;
      const customers = state.customers
        .map((c) => ({ ...c, patience: c.patience - dt }))
        .filter((c) => {
          if (c.patience <= 0) {
            return false; // walked off
          }
          return true;
        });
      const walkedOff = state.customers.length - customers.length;
      return {
        ...state,
        customers,
        time: state.time - dt,
        walkedOff: state.walkedOff + walkedOff,
      };
    }
    case "select":
      return {
        ...state,
        selected: state.selected.includes(action.id)
          ? state.selected.filter((x) => x !== action.id)
          : [...state.selected, action.id],
      };
    case "clearSelect":
      return { ...state, selected: [] };
    case "serve": {
      // try to find a customer whose order matches selected exactly
      const sel = [...state.selected].sort().join(",");
      const idx = state.customers.findIndex(
        (c) => [...c.order].sort().join(",") === sel,
      );
      if (idx === -1) {
        return {
          ...state,
          selected: [],
          misses: state.misses + 1,
          lastFeedback: "wrong order",
        };
      }
      const c = state.customers[idx];
      const rupees =
        60 +
        c.order.length * 30 +
        Math.round((c.patience / c.maxPatience) * 60);
      const customers = state.customers.filter((_, i) => i !== idx);
      return {
        ...state,
        customers,
        selected: [],
        rupees: state.rupees + rupees,
        served: state.served + 1,
        lastFeedback: `+₹${rupees}`,
      };
    }
    case "clearFeedback":
      return { ...state, lastFeedback: "" };
    case "end":
      return { ...state, ended: true };
    default:
      return state;
  }
}

const initState = {
  customers: [],
  selected: [],
  time: TIME_LIMIT,
  rupees: 0,
  served: 0,
  walkedOff: 0,
  misses: 0,
  ended: false,
  lastFeedback: "",
  hype: "",
};

export default function Level3Biryani({ onComplete }) {
  const [state, dispatch] = useReducer(reducer, initState);
  const [hype, setHype] = useState("");
  const [started, setStarted] = useState(false);
  const burst = useConfetti();
  const stateRef = useRef(state);
  stateRef.current = state;

  // game loop
  useEffect(() => {
    if (!started || state.ended) return;
    let raf;
    let last = performance.now();
    const loop = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      dispatch({ type: "tick", dt });
      if (stateRef.current.time <= 0) {
        dispatch({ type: "end" });
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [started, state.ended]);

  // customer spawner
  useEffect(() => {
    if (!started || state.ended) return;
    const spawnLoop = () => {
      dispatch({ type: "spawn" });
    };
    // initial customers
    dispatch({ type: "spawn" });
    setTimeout(() => dispatch({ type: "spawn" }), 1200);
    const interval = setInterval(spawnLoop, 4500);
    return () => clearInterval(interval);
  }, [started, state.ended]);

  // rotating hype quips
  useEffect(() => {
    if (!started || state.ended) return;
    const i = setInterval(() => setHype(feedback.biryaniHype()), 5500);
    setHype(feedback.biryaniHype());
    return () => clearInterval(i);
  }, [started, state.ended]);

  // last feedback clear
  useEffect(() => {
    if (!state.lastFeedback) return;
    const t = setTimeout(() => dispatch({ type: "clearFeedback" }), 1200);
    return () => clearTimeout(t);
  }, [state.lastFeedback]);

  const toggleItem = (id) => {
    Sound.tick();
    dispatch({ type: "select", id });
  };

  const serve = () => {
    if (state.selected.length === 0) return;
    const sel = [...state.selected].sort().join(",");
    const match = state.customers.find(
      (c) => [...c.order].sort().join(",") === sel,
    );
    if (match) {
      Sound.success();
      burst(window.innerWidth / 2, window.innerHeight * 0.6, {
        count: 25,
        power: 0.6,
      });
    } else {
      Sound.fail();
    }
    dispatch({ type: "serve" });
  };

  const clearSel = () => {
    Sound.click();
    dispatch({ type: "clearSelect" });
  };

  const handleStart = () => {
    Sound.click();
    setStarted(true);
  };

  const finalize = () => {
    Sound.click();
    // score is rupees / GOAL_RUPEES * 100, capped 100
    const score = Math.min(100, Math.round((state.rupees / GOAL_RUPEES) * 100));
    const comment =
      state.rupees >= GOAL_RUPEES
        ? "Michelin star incoming ⭐"
        : state.rupees >= GOAL_RUPEES * 0.7
          ? "Kitchen me mahayuddh ka ant hua"
          : state.rupees >= GOAL_RUPEES * 0.4
            ? "Customers ate, you tried"
            : "Google reviews incoming 📝";
    onComplete({ score, comment, stat: "biryani" });
  };

  if (!started) {
    return (
      <div className="level">
        <div className="level__header">
          <span className="level__chip">level 3 · Khaana Peena</span>
          <h1 className="level__title">Biryani shop rush</h1>
          <p className="level__sub">
            earn ₹{GOAL_RUPEES} before time runs out 🍛
          </p>
        </div>
        <div className="level__stage">
          <motion.div
            className="card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: 460, textAlign: "center" }}
          >
            <p
              style={{ marginBottom: 16, fontSize: "1.05rem", lineHeight: 1.5 }}
            >
              Customers walk up with orders. Tap the toppings they asked for,
              then hit <strong>Serve</strong>. Faster = more rupees.
            </p>
            <p
              className="hand"
              style={{ color: "var(--plum)", fontSize: "1.2rem" }}
            >
              60 seconds. don't panic. (panic a little.)
            </p>
          </motion.div>
        </div>
        <div className="level__footer">
          <button className="btn" onClick={handleStart}>
            open the shop →
          </button>
        </div>
      </div>
    );
  }

if (state.ended) {

  const passed = state.rupees >= GOAL_RUPEES;

  const successMsgs = [
    "Michelin star incoming ⭐",
    "Customer ne 5-star de diya ✨",
    "Aaj toh business ud raha hai 🚀",
    "Cash register khushi se ro raha hai 💸",
    "Restaurant arc OP ho gaya 🍽️",
    "Dhurandhar level kamai 😌",
  ];

  const midMsgs = [
  
    "Thoda chaos, thoda profit 😭",
    "Kitchen somehow survive kar gaya 👀",
    "Chef ka confidence fluctuate kar raha hai 📉",
    "Business chal raha hai... bas chal raha hai 😭",
    "Customer abhi bhi soch rahe hain 🤔",
    "Jai Bajrang Bali bolke bach gaya 😭"
  ];

  const failMsgs = [
    "Google reviews incoming 📝",
    "Customer side-eye deke gaya 😭",
    "Chef ne resignation draft khol liya 👀",
    "Manager currently unavailable 😶",
    "Yeh restaurant tha ya survival challenge 😭",
    "Aaj toh sab bhagwan bharose chal raha tha 😭"
  ];

  const comment =
    passed
      ? successMsgs[
          Math.floor(Math.random() * successMsgs.length)
        ]
      : state.rupees >= GOAL_RUPEES * 0.7
        ? midMsgs[
            Math.floor(Math.random() * midMsgs.length)
          ]
        : failMsgs[
            Math.floor(Math.random() * failMsgs.length)
          ];

  return (
    <div className="level">

      <div className="level__header">
        <span className="level__chip">
          level 3 · Khaana Peena
        </span>

        <h1 className="level__title">
          {passed
            ? "service! ✨"
            : "kitchen closed"}
        </h1>
      </div>

      <div className="level__stage">

        <motion.div
          className="card"
          initial={{
            scale:0.95,
            opacity:0
          }}
          animate={{
            scale:1,
            opacity:1
          }}
          style={{
            minWidth:320,
            textAlign:"center"
          }}
        >

          <div
            className="biryani-hud"
            style={{marginBottom:16}}
          >

            <div className="biryani-hud-card">
              <div className="biryani-hud-card__lbl">
                earned
              </div>

              <div className="biryani-hud-card__val biryani-hud-card__val--money">
                ₹{state.rupees}
              </div>
            </div>

            <div className="biryani-hud-card">
              <div className="biryani-hud-card__lbl">
                served
              </div>

              <div className="biryani-hud-card__val">
                {state.served}
              </div>
            </div>

            <div className="biryani-hud-card">
              <div className="biryani-hud-card__lbl">
                walked off
              </div>

              <div className="biryani-hud-card__val">
                {state.walkedOff}
              </div>
            </div>

          </div>

          <p
            className="hand"
            style={{
              fontSize:"1.5rem",
              color:"var(--plum)"
            }}
          >
            {comment}
          </p>

        </motion.div>

      </div>

      <div className="level__footer">
        <button
          className="btn"
          onClick={finalize}
        >
          bake this layer →
        </button>
      </div>

    </div>
  );
}

  return (
    <div className="level">
      <div className="level__header">
        <span className="level__chip">level 3 · Khaana Peena</span>
        <h1 className="level__title">Order up!</h1>
      </div>

      <div className="level__stage">
        <div className="biryani-shop">
          <div className="biryani-hud">
            <div className="biryani-hud-card">
              <div className="biryani-hud-card__lbl">earned</div>
              <div className="biryani-hud-card__val biryani-hud-card__val--money">
                ₹{state.rupees}{" "}
                <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                  / ₹{GOAL_RUPEES}
                </span>
              </div>
            </div>
            <div className="biryani-hud-card">
              <div className="biryani-hud-card__lbl">time</div>
              <div className="biryani-hud-card__val biryani-hud-card__val--time">
                {Math.max(0, Math.ceil(state.time))}s
              </div>
            </div>
            <div className="biryani-hud-card">
              <div className="biryani-hud-card__lbl">served</div>
              <div className="biryani-hud-card__val">{state.served}</div>
            </div>
          </div>

          <div className="biryani-queue">
            <AnimatePresence>
              {state.customers.map((c) => (
                <motion.div
                  key={c.id}
                  className="biryani-customer"
                  initial={{ y: -20, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 30, opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 180, damping: 18 }}
                >
                  <div
                    className="biryani-customer__face"
                    style={{ background: c.bg }}
                  >
                    {c.face}
                  </div>
                  <div className="biryani-customer__order">
                    {c.order
                      .map((id) => ITEMS.find((i) => i.id === id)?.label)
                      .join(" + ")}
                  </div>
                  <div
                    className="biryani-patience"
                    style={{
                      width: `${Math.max(0, (c.patience / c.maxPatience) * 100)}%`,
                      background:
                        c.patience < 5
                          ? "#E66A6A"
                          : c.patience < 9
                            ? "#FFD56B"
                            : "#FF8FB8",
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <p className="biryani-feedback">
            <AnimatePresence mode="wait">
              <motion.span
                key={state.lastFeedback || hype}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
              >
                {state.lastFeedback || hype}
              </motion.span>
            </AnimatePresence>
          </p>

          <div className="biryani-actions">
            {ITEMS.map((it) => (
              <button
                key={it.id}
                className={`biryani-action ${state.selected.includes(it.id) ? "biryani-action--selected" : ""}`}
                onClick={() => toggleItem(it.id)}
              >
                <span className="biryani-action__icon">{it.icon}</span>
                <span>{it.label}</span>
              </button>
            ))}
          </div>

          <div className="biryani-serve-row">
            <button
              className="btn btn--ghost"
              onClick={clearSel}
              disabled={state.selected.length === 0}
            >
              clear
            </button>
            <button
              className="btn"
              onClick={serve}
              disabled={state.selected.length === 0}
            >
              serve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
