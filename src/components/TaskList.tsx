"use client";

import { useEffect, useState } from "react";
import { TaskCard } from "@/components/TaskCard";

interface Task {
  id: number;
  name: string;
  description: string;
  points: number;
  type: "partner" | "social";
  status: "active" | "completed";
}

// Hardcoded demo tasks
const demoTasks: Task[] = [
  { id: 1, name: "Follow on Twitter", description: "Follow us on Twitter to earn points.", points: 50, type: "social", status: "active" },
  { id: 2, name: "Join Discord", description: "Join our Discord community.", points: 75, type: "social", status: "active" },
  { id: 3, name: "Complete a Trade", description: "Trade at least $50 worth of crypto.", points: 200, type: "partner", status: "active" }
];

export const TaskList = ({ taskType }: { taskType: "partner" | "social" }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Filter demo tasks by type
    setTasks(demoTasks.filter(task => task.type === taskType));
  }, [taskType]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.length > 0 ? (
        tasks.map(task => <TaskCard key={task.id} task={task} />)
      ) : (
        <p className="text-gray-400">No tasks available.</p>
      )}
    </div>
  );
};
