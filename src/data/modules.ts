export type Lesson = {
  id: string;
  title: string;
  body: string;
  audioText: string;
  imageEmoji: string;
  keyPoint?: string;
};

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  correctFeedback: string;
  incorrectFeedback: string;
};

export type Module = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  imageEmoji: string;
  isLocked: boolean;
  lessons: Lesson[];
  quiz: QuizQuestion[];
  badgeCode: string;
  badgeName: string;
  badgeDescription: string;
  xpReward: number;
};

export const MODULES: Module[] = [
  {
    id: "tech-devices",
    title: "Learning Tech Devices",
    description:
      "Learn about common technology devices and how they are used in daily life.",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    imageEmoji: "📱",
    isLocked: false,
    lessons: [
      {
        id: "lesson-1",
        title: "What is Technology?",
        body: "Technology is a tool that helps us do things faster or easier. A phone helps us call family. A printer helps us print documents. The internet helps us find information.",
        audioText:
          "Technology means tools that help us in daily life. Some examples are phones, printers, and the internet.",
        imageEmoji: "💡",
        keyPoint: "Technology helps us do things faster and easier.",
      },
      {
        id: "lesson-2",
        title: "What is a Printer?",
        body: "A printer is a device that prints words or pictures onto paper. People use printers for forms, school work, letters, and documents.",
        audioText:
          "A printer is a machine that puts words and pictures on paper. You can use a printer to print forms and letters.",
        imageEmoji: "🖨️",
        keyPoint: "Paper goes into the paper tray.",
      },
      {
        id: "lesson-3",
        title: "Safe Device Use",
        body: "Do not press unknown links. Do not share your PIN. Ask someone you trust if you are unsure about anything on your device.",
        audioText:
          "To use your device safely, do not click on links you do not know. Never share your PIN with anyone. Ask a trusted person if you are not sure.",
        imageEmoji: "🛡️",
        keyPoint: "Never share your PIN with anyone.",
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the main function of a printer?",
        options: [
          { id: "A", label: "Make phone calls" },
          { id: "B", label: "Print documents" },
          { id: "C", label: "Play music" },
        ],
        correctOptionId: "B",
        correctFeedback:
          "Correct! A printer is used to print documents and pictures.",
        incorrectFeedback:
          "Not quite. The correct answer is B. A printer prints documents and pictures.",
      },
      {
        id: "q2",
        question: "Where does the paper go in a printer?",
        options: [
          { id: "A", label: "On top" },
          { id: "B", label: "In the paper tray" },
          { id: "C", label: "Behind the printer" },
        ],
        correctOptionId: "B",
        correctFeedback: "Correct! Paper usually goes in the paper tray.",
        incorrectFeedback: "Not quite. The paper goes in the paper tray.",
      },
      {
        id: "q3",
        question:
          "What should you do if you receive a strange message asking for your PIN?",
        options: [
          { id: "A", label: "Share your PIN quickly" },
          { id: "B", label: "Ignore it or ask someone you trust" },
          { id: "C", label: "Send it to more people" },
        ],
        correctOptionId: "B",
        correctFeedback:
          "Correct! Never share your PIN. Ask someone you trust if you are unsure.",
        incorrectFeedback:
          "Be careful. You should never share your PIN with anyone.",
      },
    ],
    badgeCode: "tech_explorer",
    badgeName: "Tech Explorer",
    badgeDescription: "Completed the Learning Tech Devices module.",
    xpReward: 50,
  },
  {
    id: "internet-safety",
    title: "Internet Safety",
    description: "Learn how to stay safe when using the internet.",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    imageEmoji: "🔒",
    isLocked: true,
    lessons: [],
    quiz: [],
    badgeCode: "safe_learner",
    badgeName: "Safe Learner",
    badgeDescription: "Completed the Internet Safety module.",
    xpReward: 50,
  },
  {
    id: "online-services",
    title: "Using Online Services",
    description: "Learn how to use common online services in daily life.",
    difficulty: "Intermediate",
    estimatedMinutes: 8,
    imageEmoji: "🌐",
    isLocked: true,
    lessons: [],
    quiz: [],
    badgeCode: "digital_citizen",
    badgeName: "Digital Citizen",
    badgeDescription: "Completed the Using Online Services module.",
    xpReward: 50,
  },
];

export const DAILY_TIPS = [
  "Never share your PIN with anyone.",
  "Do not click on links from people you do not know.",
  "Always sign out when you are done using a shared device.",
  "Keep your phone charged so you can call for help.",
  "Wi-Fi lets your phone connect to the internet without using data.",
];

export const API_BASE_URL = "http://localhost:4000";
