/**
 * Funny feedback comments organized by level and score range.
 * pickComment(level, score) returns a single message string.
 */

const circle = [
  { min: 95, msg: "Professional compass detected 📐✨" },

  { min: 90, msg: "Picasso resume update kar raha hai 👀" },

  { min: 85, msg: "yeh thoda suspiciously gol hai 😭" },

  { min: 80, msg: "kaafi circle-ish honestly 😌" },

  { min: 75, msg: "aloo trying its best 🥔" },

  { min: 70, msg: "Circle with confidence issues 😭" },

  { min: 65, msg: "geometry class se bhag ke aaya hai 😭" },

  { min: 60, msg: "modern art bol dete hain 🎨" },

  { min: 55, msg: "Circlen't 😭" },

  { min: 50, msg: "abstract territory mein ghus rahe hain 👀" },

  { min: 45, msg: "bhai yeh cloud kaise ban gaya 😭" },

  { min: 40, msg: "amoeba vibes aa rahi hain 🦠" },

  { min: 35, msg: "mouse ko chheenk aa gayi thi kya 😭" },

  { min: 0, msg: "mathematicians ne kari khudkhushi ☠️" },
];

const color = [
  { min: 95, msg: "Rangon ke jadugar nikle aap 🪄" },

  { min: 90, msg: "Pantone wale location maang rahe hain 👀" },

  { min: 80, msg: "kaafi close tha honestly 😌" },

  { min: 70, msg: "aankhon ka calibration thoda hil gaya 😭" },

  { min: 60, msg: "eye-promise aap isse behtar kar sakte ho" },

  { min: 50, msg: "rangilo maaro dholna... guess aapse ho na 😌" },

  { min: 0, msg: "nayi prajaati discover ho gayi 😭" },
];

const biryaniHype = [
  "Kitchen mein halka sa tandav chal raha hai 😭",

  "Chef status: sab control mein hai... shayad 👀",

  "Customer patience dheere dheere dissolve ho rahi hai 😭",

  "Chef ne abhi jai bajrang bali bola 🚩",

  "Manager currently unavailable 😌",

  "Thoda sa chaos toh banta hai ✨",

  "Customer ne side-eye diya 😒",

  "Yeh restaurant hai ya survival challenge 😭",

  "Chef ka confidence fluctuate kar raha hai 📉",

  "Kitchen energy: controlled panic 😭",

  "Lagta hai sabko ek saath bhook lagi hai 👀",

  "Kitchen ke vibes thode questionable hain 😭",

  "Abhi sab theek chal raha hai... lagbagh 😶",
];

const dance = [
  "Grace levels thode dangerous ho rahe hain ✨",

  "Haath kuch toh sahi kar rahe hain 😌",

  "Ancestors silently nodding 👀",

  "Confidence +10 unlocked 💃",

  "Yeh toh kaafi smooth tha 😭",

  "Thoda elegance, thoda chaos 😌",

  "Moves dekh ke hawa bhi impress ho gayi ✨",

  "Body memory bol rahi hai: trust me 😭",

  "Yeh practice ka kamaal lag raha hai 👀",

  "Vibes kaafi graceful chal rahi hain 🌸",

  "Coordination department khush hai 😌",

  "Energy levels looking suspiciously good 👀",

  "Movement game strong lag raha hai 😭",

  "Grace aur drama ka perfect balance ✨",
];

const singing = {
  low: "chuhe ki private concert chal rahi hai 🐭😭",

  high: "padosi abhi complaint draft kar rahe hain 👀",

  perfect: "arre wah... aap mumbai me reh sakte hai 🎤✨",
};

const japanese = {
  right: "日本人 arc progressing",
  rightAlt: [
    "日本人 arc progressing",
    "Fir bhi dil hai Japani",
    "Senpai noticed",
    "JLPT incoming",
    "Sushi party chahiye",
    "Anime ka saath hai, darne ki kya baat hai",
  ],
  wrong: [
    "Anime subtitles itna hi door laa paye",
    "Omae wa mou shindeiru !",
    "Apka ramen order cancel.",
    "Doraemon dekhna waste",
    "Duolingo owl is disappointed",
  ],
};

function pickFromRanges(ranges, score) {
  for (const r of ranges) {
    if (score >= r.min) return r.msg;
  }
  return ranges[ranges.length - 1].msg;
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const feedback = {
  circle: (score) => pickFromRanges(circle, score),
  color: (score) => pickFromRanges(color, score),
  biryaniHype: () => rand(biryaniHype),
  dance: () => rand(dance),
  singingLow: () => singing.low,
  singingHigh: () => singing.high,
  singingPerfect: () => singing.perfect,
  japaneseRight: () => rand(japanese.rightAlt),
  japaneseWrong: () => rand(japanese.wrong),
};
