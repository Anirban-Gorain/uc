// This holds all your rules and examples in a clean data format.
const roadmapData = [
  {
    id: "step-1",
    title: "Helping Words (Is / Am / Are)",
    time: "1 Day (1 hr)",
    howTo:
      "I always goes with am. He, She, It always goes with is. You, We, They always goes with are. That's it. No other rule.",
    idea: "Think of is/am/are as a glue stick. It sticks two words together so you can say what someone is. 'He' + 'is' + 'tall' becomes one sentence.",
    examples: [
      "I am happy.",
      "He is tall.",
      "They are quiet.",
      "The box is heavy.",
    ],
  },
  {
    id: "step-2",
    title: "Helping Words (Was / Were)",
    time: "1 Day (1 hr)",
    howTo:
      "Same glue stick, but for yesterday. I/He/She/It becomes was. You/We/They becomes were.",
    idea: "This is just is/am/are's older brother. Same job, just talks about the past instead of now.",
    examples: [
      "I was sad.",
      "She was fast.",
      "They were clean.",
      "The game was fun.",
    ],
  },
  {
    id: "step-3",
    title: "Helping Words (Has / Have)",
    time: "1 Day (1 hr)",
    howTo:
      "He, She, It gets has. I, You, We, They gets have. Only use these two words to talk about owning something.",
    idea: "Has and have are like saying 'this is in my bag.' They just tell you who is carrying or owning what.",
    examples: [
      "I have a pen.",
      "He has a dog.",
      "They have bags.",
      "She has red shoes.",
    ],
  },
  {
    id: "step-4",
    title: "Showing Things (There is / There are)",
    time: "1 Day (1 hr)",
    howTo:
      "One thing? Start with 'There is'. Two or more things? Start with 'There are'.",
    idea: "Imagine pointing your finger at something and saying 'look, that's there.' That's all this phrase does — it points something out.",
    examples: [
      "There is a bird.",
      "There are two cars.",
      "There is an apple.",
      "There are ten books.",
    ],
  },
  {
    id: "step-5",
    title: "Who Owns What (Ownership)",
    time: "1 Day (1 hr)",
    howTo:
      "Add 's after a name to show it's theirs, like Rohan's bag. Use 'my' right before the thing, like 'my bag'. Use 'mine' all alone, like 'it is mine'.",
    idea: "This is like writing your name on your school bag with a marker. It just tells everyone who an object belongs to.",
    examples: [
      "This is my cup.",
      "The cup is mine.",
      "It is Tom's hat.",
      "That is her cat.",
    ],
  },
  {
    id: "step-6",
    title: "Helping Words (Do / Does)",
    time: "1 Day (1 hr)",
    howTo:
      "For He/She/It, say 'doesn't'. For I/You/We/They, say 'don't'. And after don't or doesn't, never add -s to the action word.",
    idea: "Do/does is like a stop sign for the present. It tells you an action is not happening right now.",
    examples: [
      "I do not run.",
      "He does not jump.",
      "They don't sing.",
      "She doesn't play.",
    ],
  },
  {
    id: "step-7",
    title: "Helping Words (Did)",
    time: "1 Day (1 hr)",
    howTo:
      "'Didn't' works the same for everyone — I, you, he, she, we, they, all the same. After didn't, always use the plain action word. Say 'didn't go', never 'didn't went'.",
    idea: "This is the same stop sign as do/does, just for yesterday. It says an action did not happen in the past.",
    examples: [
      "I didn't sleep.",
      "He didn't eat.",
      "They didn't win.",
      "She didn't cry.",
    ],
  },
  {
    id: "step-8",
    title: "Everyday Actions (Simple Present)",
    time: "3 Days (1 hr/day)",
    howTo:
      "Only add -s or -es to the action word when talking about one person (he, she, it). For I, you, we, they — keep the word plain, no -s.",
    idea: "This tense is for things that happen again and again, like brushing your teeth every morning. Think of the sun — it rises every single day, that's simple present.",
    examples: [
      "The sun shines.",
      "I walk fast.",
      "He reads books.",
      "They drink milk.",
    ],
  },
  {
    id: "step-9",
    title: "Right Now Actions (Present Continuous)",
    time: "2 Days (1 hr/day)",
    howTo:
      "Three pieces, always together: Person + is/am/are + action word with -ing added. Don't ever skip the is/am/are part.",
    idea: "Imagine you're filming a video right now. Whatever you see happening in that video — that's present continuous. It's only for things happening this exact second.",
    examples: [
      "I am eating.",
      "He is running.",
      "They are sleeping.",
      "She is writing.",
    ],
  },
  {
    id: "step-10",
    title: "Finished Actions (Simple Past)",
    time: "4 Days (1 hr/day)",
    howTo:
      "Many common action words change shape completely in the past — go becomes went, see becomes saw, eat becomes ate. There's no shortcut, you just slowly remember these as you use them.",
    idea: "Think of a door that's already shut. The action happened, and now it's completely done — closed, finished, over.",
    examples: [
      "I walked home.",
      "He ate bread.",
      "They saw a cat.",
      "She drew a line.",
    ],
  },
  {
    id: "step-11",
    title: "Background Actions (Past Continuous)",
    time: "2 Days (1 hr/day)",
    howTo:
      "Use was/were + action word with -ing. Use it to describe something that was already going on when something else happened.",
    idea: "Imagine a movie scene. Something is happening quietly in the background — maybe it's raining — while the main action happens in front. The rain is the past continuous part.",
    examples: [
      "I was reading.",
      "He was flying.",
      "They were singing.",
      "She was jumping.",
    ],
  },
  {
    id: "step-12",
    title: "Tomorrow Actions (Simple Future)",
    time: "2 Days (1 hr/day)",
    howTo:
      "Use 'will' + action word when you decide something on the spot, in that moment. Use 'going to' + action word when you already had a plan before.",
    idea: "Picture an arrow pointing forward in time. This tense is for anything that hasn't happened yet but will happen later.",
    examples: [
      "I will sleep.",
      "He will paint.",
      "They are going to fly.",
      "She will dance.",
    ],
  },
  {
    id: "step-13",
    title: "Life Experiences (Present Perfect)",
    time: "3 Days (1 hr/day)",
    howTo:
      "Use have/has + a special finished-action word (done, seen, eaten). The exact time it happened doesn't matter — only that it happened at some point.",
    idea: "This is like a stamp in your passport from a trip you took. It proves you've been somewhere or done something — but nobody cares exactly which day it happened.",
    examples: [
      "I have eaten.",
      "He has jumped.",
      "They have won.",
      "She has fallen.",
    ],
  },
  {
    id: "step-14",
    title: "Asking Yes/No (Yes / No Questions)",
    time: "2 Days (1 hr/day)",
    howTo:
      "Take the helping word (are, is, do, did, can) and move it to the very front of the sentence. Everything else stays the same.",
    idea: "This is like flipping a coin — the only two answers possible are yes or no. Nothing in between.",
    examples: ["Are you tall?", "Did he run?", "Is it hot?", "Do they jump?"],
  },
  {
    id: "step-15",
    title: "Asking for Facts (WH- Questions)",
    time: "3 Days (1 hr/day)",
    howTo:
      "Always build it in this exact order: question word (where, when, why, what) first, then the helping word, then the person, then the action.",
    idea: "Think of this as a detective's magnifying glass. You use it when you're missing one specific piece of information — a place, a time, or a name — and you need to find it.",
    examples: [
      "Where is the cat?",
      "When did he go?",
      "Why are you sad?",
      "What did they eat?",
    ],
  },
  {
    id: "step-16",
    title: "Being Polite (Can / Could)",
    time: "1 Day (1 hr)",
    howTo:
      "Use 'can' when you're simply talking about ability — what someone is able to do. Use 'could' when you want to sound softer and more polite, especially when asking for something.",
    idea: "Think of these words as a power meter. They tell you whether someone has the strength, skill, or permission to do something.",
    examples: [
      "I can lift it.",
      "Can a bird swim?",
      "Could you help?",
      "He can run fast.",
    ],
  },
  {
    id: "step-17",
    title: "Giving Advice (Should)",
    time: "1 Day (1 hr)",
    howTo:
      "Just use 'should' + the plain action word. Keep it simple, nothing extra added.",
    idea: "This is a soft nudge, not an order. It's you gently pointing someone toward the better choice, not forcing them.",
    examples: [
      "You should rest.",
      "He should eat.",
      "They should stop.",
      "She should wait.",
    ],
  },
  {
    id: "step-18",
    title: "Must-Do Rules (Have to / Must)",
    time: "1 Day (1 hr)",
    howTo:
      "Use 'have to' + plain action word when a rule is coming from outside you — like school or work. Use 'must' when the urgency is something you feel inside yourself.",
    idea: "Think of a locked gate with no other way around it. This is for actions where there's genuinely no choice — it simply has to happen.",
    examples: [
      "I must sleep.",
      "He has to run.",
      "They must stop.",
      "She has to pay.",
    ],
  },
  {
    id: "step-19",
    title: "Friendly Ideas (Let's / Why don't we)",
    time: "1 Day (1 hr)",
    howTo:
      "Use 'Let's' + action word, or 'Why don't we' + action word. Both mean the same friendly invitation.",
    idea: "Picture a magnet pulling a group of people together to do one thing at the same time, like friends agreeing to go out.",
    examples: [
      "Let's play now.",
      "Let's go home.",
      "Why don't we sing?",
      "Why don't we run?",
    ],
  },
  {
    id: "step-20",
    title: "Comparing Things (More / Better)",
    time: "2 Days (1 hr/day)",
    howTo:
      "For short words, just add -er at the end, like faster. For longer words, put 'more' in front instead. And always use the word 'than' to connect the two things you're comparing.",
    idea: "Picture an old-fashioned weighing scale with two sides. You're putting two things on it to see which one is heavier, faster, or bigger.",
    examples: [
      "A cat is smaller than a dog.",
      "He is faster than me.",
      "The sun is hotter than fire.",
      "She is taller than him.",
    ],
  },
  {
    id: "step-21",
    title: "Time Words (At, On, In for Time)",
    time: "2 Days (1 hr/day)",
    howTo:
      "Use 'at' for an exact clock time. Use 'on' for a specific day. Use 'in' for a longer stretch, like a month or a year.",
    idea: "Imagine three boxes of different sizes. 'At' is a tiny box for one exact moment. 'On' is a medium box for one day. 'In' is a big box that can fit a whole month or year inside.",
    examples: [
      "It starts at noon.",
      "We play on Monday.",
      "Snow falls in winter.",
      "I wake up at six.",
    ],
  },
  {
    id: "step-22",
    title: "Place Words (At, On, In for Place)",
    time: "2 Days (1 hr/day)",
    howTo:
      "Use 'at' for one exact spot. Use 'on' when something is resting on top of a surface. Use 'in' when something is enclosed inside.",
    idea: "Think about where a dot could be placed in a room: right at the door, on top of the table, or in the drawer. Same three words, now for space instead of time.",
    examples: [
      "The bug is on the leaf.",
      "The pen is in the box.",
      "He is at the door.",
      "The hat is on his head.",
    ],
  },
  {
    id: "step-23",
    title: "Direction Words (To & From)",
    time: "1 Day (1 hr)",
    howTo:
      "'From' marks where something begins, and 'to' marks where it ends up. Keep the sentence simple, don't add extra words around them.",
    idea: "Picture a bridge connecting two riverbanks — one side is the start (from), the other side is the end (to).",
    examples: [
      "I ran to the tree.",
      "A letter from you.",
      "He walked to the park.",
      "Water falls from the sky.",
    ],
  },
  {
    id: "step-24",
    title: "Joining Thoughts (And / But)",
    time: "1 Day (1 hr)",
    howTo:
      "Use 'and' when the two ideas agree or add onto each other. Use 'but' when the second idea goes against or surprises you compared to the first.",
    idea: "Think of these as train car hooks. They connect two small, separate sentences together into one longer train of thought.",
    examples: [
      "I like apples and grapes.",
      "He is small but strong.",
      "The dog ran and hid.",
      "It is cold but sunny.",
    ],
  },
  {
    id: "step-25",
    title: "Giving Reasons (So / Because)",
    time: "1 Day (1 hr)",
    howTo:
      "'Because' explains the reason behind something. 'So' explains the result that happened because of it. Never put both words in the same sentence.",
    idea: "Picture a row of dominoes falling, one pushing the next. 'Because' is the first domino falling, 'so' is the one that falls right after.",
    examples: [
      "I slept because I was tired.",
      "I was hot, so I swam.",
      "He fell because he ran fast.",
      "It rained, so I stayed inside.",
    ],
  },
  {
    id: "step-26",
    title: "Daily Rules (If - Zero Condition)",
    time: "1 Day (1 hr)",
    howTo:
      "Pattern: 'If' + simple present, then simple present again. No 'will' anywhere in this sentence.",
    idea: "This is for things that are always true, like a science fact. If you touch fire, it always burns you — every single time, no exceptions.",
    examples: [
      "If ice gets hot, it melts.",
      "If it rains, grass gets wet.",
      "If you drop an egg, it breaks.",
      "If a dog sees a cat, it barks.",
    ],
  },
  {
    id: "step-27",
    title: "Future Plans (If - First Condition)",
    time: "1 Day (1 hr)",
    howTo: "Pattern: 'If' + simple present, then 'will' + action word.",
    idea: "This is for things that could realistically happen. It's a real possibility, not just daydreaming — if it rains tomorrow, I will take an umbrella.",
    examples: [
      "If I fall, I will cry.",
      "If she runs, she will win.",
      "If it is dark, I will turn on the light.",
      "If he asks, I will tell him.",
    ],
  },
  {
    id: "step-28",
    title: "Dream Scenarios (If - Second Condition)",
    time: "2 Days (1 hr/day)",
    howTo: "Pattern: 'If' + simple past, then 'would' + action word.",
    idea: "This is pure imagination — things that are not real and not happening right now. Like saying 'if I had wings, I would fly,' even though you know you'll never actually grow wings.",
    examples: [
      "If I had wings, I would fly.",
      "If he were a king, he would smile.",
      "If pigs could talk, they would say hello.",
      "If I lived on the moon, I would jump high.",
    ],
  },
];
