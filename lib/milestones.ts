export type Milestone = {
  title: string;
  verb: string;
  body: string;
  artifact: string;
};

export const milestones: Milestone[] = [
  {
    title: "Problem understanding",
    verb: "Notice",
    body: "Find a problem worth solving, and talk to the people who actually have it.",
    artifact: "Problem statement",
  },
  {
    title: "Project proposal",
    verb: "Commit",
    body: "Shape the idea into a plan: who it's for, what's in scope, what success looks like.",
    artifact: "Proposal",
  },
  {
    title: "Software Requirements Specification",
    verb: "Specify",
    body: "Write down exactly what the software must do, the way professional teams do.",
    artifact: "SRS document",
  },
  {
    title: "System design",
    verb: "Design",
    body: "Sketch the architecture, data, and screens before a single line of code.",
    artifact: "Design doc & wireframes",
  },
  {
    title: "Implementation",
    verb: "Build",
    body: "Build in focused increments, one working feature at a time.",
    artifact: "Working codebase",
  },
  {
    title: "Testing",
    verb: "Verify",
    body: "Break your own work on purpose, then make it stronger.",
    artifact: "Test plan & results",
  },
  {
    title: "Deployment",
    verb: "Ship",
    body: "Put it on the internet, where real people can use it.",
    artifact: "Live link",
  },
  {
    title: "Final presentation",
    verb: "Present",
    body: "Tell the story of what you built, why it matters, and what you learned.",
    artifact: "Demo day",
  },
];
