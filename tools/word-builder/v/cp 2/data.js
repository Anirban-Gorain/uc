const data = {
  district: "Foundation Hub",
  totalBuildings: 10,
  totalFloors: 50,
  totalWords: 250,
  buildings: [
    {
      id: "foundation_1",
      name: "The Power Plant",
      category: "foundation",
      unlockOrder: 1,
      floors: [
        {
          floorNumber: 1,
          title: "The Big Five Makers",
          wordList: ["Make", "Get", "Take", "Keep", "Give"],
        },
        {
          floorNumber: 2,
          title: "Placing & Moving",
          wordList: ["Put", "Set", "Turn", "Hold", "Bring"],
        },
        {
          floorNumber: 3,
          title: "Starting & Stopping",
          wordList: ["Run", "Leave", "Start", "Stop", "Stay"],
        },
        {
          floorNumber: 4,
          title: "Action Combos (Phrasal Verbs 1)",
          wordList: [
            "Pick up",
            "Drop off",
            "Find out",
            "Figure out",
            "Look for",
          ],
        },
        {
          floorNumber: 5,
          title: "Life Combos (Phrasal Verbs 2)",
          wordList: ["Show up", "Turn up", "Give up", "Work out", "Point out"],
        },
      ],
    },
    {
      id: "foundation_2",
      name: "Action Center",
      category: "foundation",
      unlockOrder: 2,
      floors: [
        {
          floorNumber: 1,
          title: "Taking Control",
          wordList: ["Manage", "Handle", "Fix", "Deal with", "Solve"],
        },
        {
          floorNumber: 2,
          title: "Preventing Trouble",
          wordList: ["Avoid", "Prevent", "Save", "Waste", "Spend"],
        },
        {
          floorNumber: 3,
          title: "Checking & Helping",
          wordList: ["Check", "Share", "Join", "Follow", "Support"],
        },
        {
          floorNumber: 4,
          title: "Making Things Better",
          wordList: ["Prepare", "Arrange", "Improve", "Change", "Replace"],
        },
        {
          floorNumber: 5,
          title: "Pushing Through",
          wordList: ["Complete", "Continue", "Struggle", "Try", "Fail"],
        },
      ],
    },
    {
      id: "foundation_3",
      name: "Mind Studio",
      category: "foundation",
      unlockOrder: 3,
      floors: [
        {
          floorNumber: 1,
          title: "Making Choices",
          wordList: ["Decide", "Choose", "Prefer", "Plan", "Expect"],
        },
        {
          floorNumber: 2,
          title: "Seeing & Knowing",
          wordList: ["Notice", "Realize", "Remember", "Forget", "Remind"],
        },
        {
          floorNumber: 3,
          title: "Guessing & Doubting",
          wordList: ["Wonder", "Guess", "Suppose", "Doubt", "Trust"],
        },
        {
          floorNumber: 4,
          title: "Learning & Focusing",
          wordList: ["Focus", "Understand", "Confuse", "Compare", "Imagine"],
        },
        {
          floorNumber: 5,
          title: "Caring & Feeling",
          wordList: ["Care", "Matter", "Mind", "Worry", "Hope"],
        },
      ],
    },
    {
      id: "foundation_4",
      name: "Voice Station",
      category: "foundation",
      unlockOrder: 4,
      floors: [
        {
          floorNumber: 1,
          title: "Clear Explaining",
          wordList: ["Explain", "Mention", "Suggest", "Discuss", "Describe"],
        },
        {
          floorNumber: 2,
          title: "Yes and No Words",
          wordList: ["Agree", "Disagree", "Promise", "Refuse", "Accept"],
        },
        {
          floorNumber: 3,
          title: "Asking & Replying",
          wordList: ["Reply", "Respond", "Ask", "Invite", "Offer"],
        },
        {
          floorNumber: 4,
          title: "Hard Conversations",
          wordList: ["Complain", "Argue", "Warn", "Admit", "Blame"],
        },
        {
          floorNumber: 5,
          title: "Friendly Talk",
          wordList: [
            "Thank",
            "Apologize",
            "Interrupt",
            "Convince",
            "Encourage",
          ],
        },
      ],
    },
    {
      id: "foundation_5",
      name: "Clock Tower",
      category: "foundation",
      unlockOrder: 5,
      floors: [
        {
          floorNumber: 1,
          title: "Daily Habits",
          wordList: ["Usually", "Normally", "Often", "Sometimes", "Rarely"],
        },
        {
          floorNumber: 2,
          title: "Done or Waiting",
          wordList: ["Already", "Yet", "Still", "Soon", "Early"],
        },
        {
          floorNumber: 3,
          title: "Fast Action",
          wordList: [
            "Suddenly",
            "Immediately",
            "Quickly",
            "Instantly",
            "On time",
          ],
        },
        {
          floorNumber: 4,
          title: "Past & Recent",
          wordList: ["Recently", "Lately", "Earlier", "Once", "Ago"],
        },
        {
          floorNumber: 5,
          title: "The Long Run",
          wordList: [
            "Eventually",
            "Finally",
            "Meanwhile",
            "Constantly",
            "Temporary",
          ],
        },
      ],
    },
    {
      id: "foundation_6",
      name: "Mirror House",
      category: "foundation",
      unlockOrder: 6,
      floors: [
        {
          floorNumber: 1,
          title: "Telling the Truth",
          wordList: ["Actually", "Honestly", "Really", "Literally", "Simply"],
        },
        {
          floorNumber: 2,
          title: "How Close Is It?",
          wordList: ["Almost", "Nearly", "Barely", "Hardly", "Enough"],
        },
        {
          floorNumber: 3,
          title: "How Sure Are You?",
          wordList: ["Definitely", "Certainly", "Probably", "Maybe", "Perhaps"],
        },
        {
          floorNumber: 4,
          title: "Exact & Clear",
          wordList: ["Exactly", "Completely", "Totally", "Mostly", "Partly"],
        },
        {
          floorNumber: 5,
          title: "Natural Fillers",
          wordList: [
            "Obviously",
            "Clearly",
            "Seriously",
            "Basically",
            "Anyway",
          ],
        },
      ],
    },
    {
      id: "foundation_7",
      name: "Bridge Control",
      category: "foundation",
      unlockOrder: 7,
      floors: [
        {
          floorNumber: 1,
          title: "Swapping & Choosing",
          wordList: ["Instead", "Rather", "Besides", "Apart from", "Otherwise"],
        },
        {
          floorNumber: 2,
          title: "Turning the Story",
          wordList: ["However", "Although", "Even though", "Despite", "Still"],
        },
        {
          floorNumber: 3,
          title: "Cause and Result",
          wordList: ["Therefore", "Because of", "Due to", "So that", "In case"],
        },
        {
          floorNumber: 4,
          title: "Rules & Conditions",
          wordList: ["Unless", "Whether", "As long as", "Provided", "Even if"],
        },
        {
          floorNumber: 5,
          title: "Pointing Out",
          wordList: [
            "Especially",
            "Particularly",
            "For example",
            "Such as",
            "In fact",
          ],
        },
      ],
    },
    {
      id: "foundation_8",
      name: "Mood Theatre",
      category: "foundation",
      unlockOrder: 8,
      floors: [
        {
          floorNumber: 1,
          title: "Strong & Nervous",
          wordList: ["Confident", "Nervous", "Awkward", "Comfortable", "Shy"],
        },
        {
          floorNumber: 2,
          title: "Heart & Hurt",
          wordList: ["Upset", "Annoyed", "Frustrated", "Proud", "Grateful"],
        },
        {
          floorNumber: 3,
          title: "Good Character",
          wordList: ["Honest", "Polite", "Rude", "Kind", "Selfish"],
        },
        {
          floorNumber: 4,
          title: "Energy Levels",
          wordList: ["Calm", "Patient", "Serious", "Strict", "Friendly"],
        },
        {
          floorNumber: 5,
          title: "Mind & Mood",
          wordList: ["Excited", "Bored", "Exhausted", "Shocked", "Surprised"],
        },
      ],
    },
    {
      id: "foundation_9",
      name: "Signal Tower",
      category: "foundation",
      unlockOrder: 9,
      floors: [
        {
          floorNumber: 1,
          title: "Size & Scale",
          wordList: ["Massive", "Huge", "Tiny", "Plenty", "Extra"],
        },
        {
          floorNumber: 2,
          title: "How Good Is It?",
          wordList: ["Decent", "Proper", "Perfect", "Awful", "Terrible"],
        },
        {
          floorNumber: 3,
          title: "How Hard Is It?",
          wordList: ["Urgent", "Tough", "Simple", "Complicated", "Smooth"],
        },
        {
          floorNumber: 4,
          title: "Normal or Strange",
          wordList: ["Weird", "Strange", "Normal", "Common", "Rare"],
        },
        {
          floorNumber: 5,
          title: "Real World Value",
          wordList: ["Obvious", "Clear", "Possible", "Necessary", "Useful"],
        },
      ],
    },
    {
      id: "foundation_10",
      name: "Life Square",
      category: "foundation",
      unlockOrder: 10,
      floors: [
        {
          floorNumber: 1,
          title: "Choices & Chances",
          wordList: ["Reason", "Option", "Choice", "Chance", "Idea"],
        },
        {
          floorNumber: 2,
          title: "Ups and Downs",
          wordList: ["Problem", "Issue", "Mistake", "Fault", "Solution"],
        },
        {
          floorNumber: 3,
          title: "Daily Routine",
          wordList: ["Habit", "Routine", "Schedule", "Plan", "Goal"],
        },
        {
          floorNumber: 4,
          title: "Moments & Help",
          wordList: ["Situation", "Moment", "Experience", "Advice", "Opinion"],
        },
        {
          floorNumber: 5,
          title: "Results & Rules",
          wordList: ["Result", "Difference", "Effort", "Rule", "Limit"],
        },
      ],
    },
  ],
};
