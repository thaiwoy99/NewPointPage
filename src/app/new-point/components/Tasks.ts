// Define the Task interface
interface TaskDetails {
  title: string;
  isCompleted?: boolean;
}

// Create the tasks array
const tasks: TaskDetails[] = [
  {
    title: "You got invited",
    isCompleted: true
  },
  {
    title: "Link Discord",
    isCompleted: true
  },
  {
    title: "Join Community Channel",
    isCompleted: false
  },
  {
    title: "Connect X",
    isCompleted: false
  },
  {
    title: "Follow Deserialize on X",
    isCompleted: false
  },
  {
    title: "Swap over $1,000",
    isCompleted: false
  },
  {
    title: "Follow Delabz on X",
    isCompleted: false
  },
  {
    title: "Refer 5 Deserializers",
    isCompleted: false
  },
  {
    title: "Bridge over $1,000",
    isCompleted: false
  },
  {
    title: "Launch Limit Order 10 times",
    isCompleted: false
  },
  {
    title: "Complete 10 Partners' Tasks",
    isCompleted: false
  }
];


export { tasks,  type TaskDetails };