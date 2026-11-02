/**
 * @file data.js
 * @description Master curriculum, psychological hooks, and situational missions for Fluency City.
 */

export const CURRICULUM_DATA = {
  district: "Foundation Hub",
  totalBuildings: 10,
  totalFloors: 50,
  totalWords: 250,
  buildings: [
    {
      id: "foundation_1",
      name: "Chai Tapri",
      level: "01",
      hook: "Bolna Shuru Karo",
      category: "foundation",
      unlockOrder: 1,
      image: "assets/buildings/foundation_1.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "You stand in front of the tea stall counter: order your tea, ask for biscuits, pay money, and take your change without freezing.",
          wordList: ["Make", "Get", "Take", "Keep", "Give"],
        },
        {
          floorNumber: 2,
          mission:
            "You sit on the wooden bench with your friend: tell them where to put their heavy bag, pass a cup, and hold your helmet.",
          wordList: ["Put", "Set", "Pass", "Hold", "Bring"],
        },
        {
          floorNumber: 3,
          mission:
            "Hot tea is served: warn your friend about the hot glass, drink slowly, taste the biscuits, and enjoy the break.",
          wordList: ["Touch", "Sip", "Taste", "Enjoy", "Finish"],
        },
        {
          floorNumber: 4,
          mission:
            "Your phone rings at the stall: pick up the call, step outside the crowd, talk clearly, and hang up when you are done.",
          wordList: ["Hear", "Pick up", "Step out", "Speak", "Hang up"],
        },
        {
          floorNumber: 5,
          mission:
            "The tea break ends: tell your friends to get up, pay the bill together, throw cups in the bin, and leave for work.",
          wordList: ["Stand up", "Clear", "Throw", "Leave", "Meet"],
        },
      ],
    },
    {
      id: "foundation_2",
      name: "City Bus Depot",
      level: "02",
      hook: "Safarnama English",
      category: "foundation",
      unlockOrder: 2,
      image: "assets/buildings/foundation_2.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "You arrive at the busy bus station: ask people for your bus route, check the big timetable board, and locate your platform.",
          wordList: ["Ask", "Look for", "Find", "Check", "Wait"],
        },
        {
          floorNumber: 2,
          mission:
            "The bus arrives at the platform: stand in line calmly, walk through the crowd, step inside, and grab an empty window seat.",
          wordList: ["Line up", "Move", "Step in", "Sit down", "Grab"],
        },
        {
          floorNumber: 3,
          mission:
            "The conductor comes for the fare: ask the ticket price, hand over your cash, ask for your ticket, and count the change.",
          wordList: ["Cost", "Hand over", "Pay", "Count", "Return"],
        },
        {
          floorNumber: 4,
          mission:
            "The bus moves through city traffic: tell the driver where to drop you, watch for your stop, and warn someone to hold the bar.",
          wordList: ["Drop off", "Watch", "Notice", "Remind", "Hold on"],
        },
        {
          floorNumber: 5,
          mission:
            "Your stop is near: ring the bell, step down carefully onto the road, thank the driver, and walk to your street.",
          wordList: ["Stop", "Step out", "Thank", "Cross", "Reach"],
        },
      ],
    },
    {
      id: "foundation_3",
      name: "Sabzi Mandi",
      level: "03",
      hook: "Paisa Vasool Talk",
      category: "foundation",
      unlockOrder: 3,
      image: "assets/buildings/foundation_3.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "You walk into the fresh fruit and vegetable market: look at the food carts, ask what is fresh, and pick what you like.",
          wordList: ["Look at", "Choose", "Pick", "Prefer", "Want"],
        },
        {
          floorNumber: 2,
          mission:
            "Talking to the vegetable seller: check the rate per kilo, ask to weigh the bag, and talk about the price.",
          wordList: ["Weigh", "Measure", "Check", "Compare", "Match"],
        },
        {
          floorNumber: 3,
          mission:
            "Checking vegetable quality: spot bad tomatoes, separate green potatoes, smell fresh coriander, and ask for clean pieces.",
          wordList: ["Spot", "Clean", "Smell", "Remove", "Change"],
        },
        {
          floorNumber: 4,
          mission:
            "The seller asks for too much money: say it is too costly, ask for a discount, refuse extra prices, and agree on a fair rate.",
          wordList: ["Refuse", "Accept", "Reduce", "Agree", "Finalize"],
        },
        {
          floorNumber: 5,
          mission:
            "Paying at the vegetable cart: scan the UPI code with your phone, check if the money went through, pack bags, and carry them home.",
          wordList: ["Scan", "Send", "Confirm", "Pack", "Carry"],
        },
      ],
    },
    {
      id: "foundation_4",
      name: "Mistri Garage",
      level: "04",
      hook: "Fix Har Problem",
      category: "foundation",
      unlockOrder: 4,
      image: "assets/buildings/foundation_4.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "Your motorcycle stops running on the road: explain the noise to the mechanic, show the flat tire, and ask for help.",
          wordList: ["Explain", "Point out", "Show", "Break down", "Ask for"],
        },
        {
          floorNumber: 2,
          mission:
            "The mechanic opens the engine: look at broken parts, test the brake, see what is wrong, and figure out the exact problem.",
          wordList: ["Open", "Inspect", "Test", "Discover", "Figure out"],
        },
        {
          floorNumber: 3,
          mission:
            "Discussing the repair work: decide to replace worn-out parts, clean the dirty plug, oil the chain, and fix the loose mirror.",
          wordList: ["Replace", "Fix", "Wash", "Tighten", "Repair"],
        },
        {
          floorNumber: 4,
          mission:
            "Waiting for your bike: ask how many minutes it will take, tell the mechanic not to rush, and wait quietly on the bench.",
          wordList: ["Manage", "Handle", "Wait for", "Hurry", "Promise"],
        },
        {
          floorNumber: 5,
          mission:
            "The bike is ready: test ride it on the road, check that the engine is smooth, pay the repair charges, and ride away safely.",
          wordList: ["Start up", "Ride", "Check out", "Settle", "Drive"],
        },
      ],
    },
    {
      id: "foundation_5",
      name: "Apna Mohalla",
      level: "05",
      hook: "Padosi Se Dosti",
      category: "foundation",
      unlockOrder: 5,
      image: "assets/buildings/foundation_5.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "You see a neighbor on your street: say a friendly hello, ask how their day is going, and introduce your family politely.",
          wordList: ["Greet", "Welcome", "Introduce", "Smile", "Reply"],
        },
        {
          floorNumber: 2,
          mission:
            "Talking about daily house life: share what you usually cook, talk about power cuts, and borrow extra sugar or a toolbox.",
          wordList: ["Borrow", "Lend", "Share", "Return", "Help out"],
        },
        {
          floorNumber: 3,
          mission:
            "Handling neighborhood street problems: talk politely about loud music, ask to park cars properly, and keep the lane clean.",
          wordList: [
            "Mention",
            "Suggest",
            "Complain",
            "Apologize",
            "Understand",
          ],
        },
        {
          floorNumber: 4,
          mission:
            "Inviting neighbors home: invite people for evening tea, offer snacks, welcome them in, and make them feel comfortable.",
          wordList: ["Invite", "Offer", "Host", "Join in", "Serve"],
        },
        {
          floorNumber: 5,
          mission:
            "Festival celebration in the lane: celebrate together, share home sweets, take group photos, and wish everyone great joy.",
          wordList: ["Celebrate", "Distribute", "Wish", "Praise", "Support"],
        },
      ],
    },
    {
      id: "foundation_6",
      name: "Sarkari Seva Kendra",
      level: "06",
      hook: "Bina Darr Ka Kaam",
      category: "foundation",
      unlockOrder: 6,
      image: "assets/buildings/foundation_6.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "You enter a government help office: ask where to get your form, stand in the right room queue, and wait for your token number.",
          wordList: ["Enter", "Follow", "Direct", "Wait", "Collect"],
        },
        {
          floorNumber: 2,
          mission:
            "Sitting at the desk with your forms: fill out your name and address, attach your photo, sign the line, and double-check spelling.",
          wordList: ["Fill in", "Attach", "Sign", "Verify", "Submit"],
        },
        {
          floorNumber: 3,
          mission:
            "The officer checks your identity proof: show original cards, explain missing copies, correct wrong details, and clear any doubt.",
          wordList: ["Present", "Confirm", "Correct", "Clarify", "Prove"],
        },
        {
          floorNumber: 4,
          mission:
            "There is a long delay at the window: ask politely about the delay, request quick processing, and avoid getting angry or rude.",
          wordList: ["Request", "Inquire", "Insist", "Stay calm", "Remind"],
        },
        {
          floorNumber: 5,
          mission:
            "Finishing your application: get your stamped slip, ask when your card will arrive by post, thank the officer, and step out.",
          wordList: ["Receive", "Stamp", "Track", "Acknowledge", "Depart"],
        },
      ],
    },
    {
      id: "foundation_7",
      name: "Janata Dawakhana",
      level: "07",
      hook: "Sehat Ki Baat",
      category: "foundation",
      unlockOrder: 7,
      image: "assets/buildings/foundation_7.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "You reach the doctor clinic with a fever: tell the reception nurse your name, book a slot, sit down, and wait for your turn.",
          wordList: ["Register", "Describe", "Suffer", "Wait for", "Consult"],
        },
        {
          floorNumber: 2,
          mission:
            "Inside the doctor cabin: explain your stomach ache, tell when the headache started, show where it hurts, and answer checkup questions.",
          wordList: ["Feel", "Ache", "Hurt", "Explain", "Point to"],
        },
        {
          floorNumber: 3,
          mission:
            "The doctor checks you: breathe in and out slowly, open your mouth, check your body temperature, and listen to medical advice.",
          wordList: ["Breathe", "Examine", "Advise", "Prescribe", "Warn"],
        },
        {
          floorNumber: 4,
          mission:
            "At the chemist medicine shop: show the paper prescription, ask how many tablets to swallow, check the expiry date, and buy medicines.",
          wordList: ["Show", "Purchase", "Swallow", "Take", "Store"],
        },
        {
          floorNumber: 5,
          mission:
            "Resting at home to recover: follow the food diet, drink warm boiled water, rest well in bed, and tell your boss you need leave.",
          wordList: ["Rest", "Recover", "Heal", "Inform", "Improve"],
        },
      ],
    },
    {
      id: "foundation_8",
      name: "Kamaal Bazar",
      level: "08",
      hook: "Smart Shopper Bano",
      category: "foundation",
      unlockOrder: 8,
      image: "assets/buildings/foundation_8.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "You enter a clothes and shoe shop: ask the helper for your shirt size, look at colors, and ask where the trial room is.",
          wordList: ["Try on", "Fit", "Match", "Look for", "Select"],
        },
        {
          floorNumber: 2,
          mission:
            "Inside the trial fitting room: check if the jeans are too tight or loose, check the mirror, and ask for a bigger size.",
          wordList: ["Change", "Wear", "Adjust", "Complain", "Prefer"],
        },
        {
          floorNumber: 3,
          mission:
            "Checking home items and electronics: ask how the machine works, check the warranty card, and ask if delivery is free.",
          wordList: ["Test", "Operate", "Guarantee", "Deliver", "Protect"],
        },
        {
          floorNumber: 4,
          mission:
            "At the billing counter: ask about festive offers, choose between cash or card, take your printed bill, and collect the carry bag.",
          wordList: ["Discount", "Save", "Spend", "Charge", "Collect"],
        },
        {
          floorNumber: 5,
          mission:
            "Returning a damaged shirt next day: show the torn cloth, show your original bill, ask for a clean replacement, or take a refund.",
          wordList: ["Return", "Exchange", "Refund", "Complain", "Resolve"],
        },
      ],
    },
    {
      id: "foundation_9",
      name: "Talkies Cinema",
      level: "09",
      hook: "Dil Khol Ke Haso",
      category: "foundation",
      unlockOrder: 9,
      image: "assets/buildings/foundation_9.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "Meeting friends outside the movie hall: pick which movie to watch, choose show timings, and book seats together in the middle row.",
          wordList: ["Decide", "Choose", "Book", "Gather", "Arrive"],
        },
        {
          floorNumber: 2,
          mission:
            "At the movie snacks stall: order butter popcorn and cold drinks, ask for napkins, and carry food trays inside the dark hall.",
          wordList: ["Order", "Grab", "Balance", "Hold", "Carry in"],
        },
        {
          floorNumber: 3,
          mission:
            "Finding your hall seats: show your phone ticket to the guard, look for seat letters in the dark, and sit down without disturbing others.",
          wordList: ["Check in", "Guide", "Locate", "Excuse", "Sit"],
        },
        {
          floorNumber: 4,
          mission:
            "Watching the film: laugh at the funny comedy scenes, get surprised by twists, hold your breath during fights, and clap for hero scenes.",
          wordList: ["Enjoy", "Laugh", "Cheer", "Surprise", "Wonder"],
        },
        {
          floorNumber: 5,
          mission:
            "Walking out after the show: share your movie review with friends, discuss the best actor scenes, rate the story, and plan where to eat.",
          wordList: ["Discuss", "Describe", "Rate", "Recommend", "Argue"],
        },
      ],
    },
    {
      id: "foundation_10",
      name: "Raja Chowk",
      level: "10",
      hook: "Shaan Se Interview Do",
      category: "foundation",
      unlockOrder: 10,
      image: "assets/buildings/foundation_10.png",
      floors: [
        {
          floorNumber: 1,
          mission:
            "Walking into an office building: greet the reception desk, tell who you are meeting, sign the guest book, and wait in the lobby.",
          wordList: ["Introduce", "Report", "Wait for", "Inform", "Follow"],
        },
        {
          floorNumber: 2,
          mission:
            "Knocking on the interview cabin door: ask permission to come in, shake hands with confidence, sit straight, and smile warmly.",
          wordList: ["Knock", "Enter", "Greet", "Sit", "Begin"],
        },
        {
          floorNumber: 3,
          mission:
            "Talking about your life and studies: explain your background, share what you are good at, and talk about past work with pride.",
          wordList: ["Explain", "Demonstrate", "Express", "Manage", "Achieve"],
        },
        {
          floorNumber: 4,
          mission:
            "Handling tricky interview questions: admit when you do not know something, show your willingness to learn, and ask about the team.",
          wordList: ["Admit", "Learn", "Adapt", "Ask", "Contribute"],
        },
        {
          floorNumber: 5,
          mission:
            "Ending the interview with dignity: thank the interviewers for their time, leave your contact number, walk out tall, and celebrate your effort.",
          wordList: ["Thank", "Conclude", "Promise", "Succeed", "Stand proud"],
        },
      ],
    },
  ],
};
