export const tasks: Task[] = [
  {
    id: "1",
    name: "Gym Training Session",
    start: new Date(2024, 1, 10),
    end: new Date(2024, 1, 10, 2), // 2-hour session
    progress: 100,
    type: "task",
  },
  {
    id: "2",
    name: "Yoga Class",
    start: new Date(2024, 1, 11),
    end: new Date(2024, 1, 11, 1, 30),
    progress: 0,
    type: "task",
  },
  {
    id: "3",
    name: "Tutoring Session",
    start: new Date(2024, 1, 12),
    end: new Date(2024, 1, 12, 3),
    progress: 50,
    type: "task",
  },
];
