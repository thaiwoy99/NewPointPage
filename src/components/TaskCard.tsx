import { Button } from "@/components/ui/button";

interface TaskProps {
  task: {
    id: number;
    name: string;
    description: string;
    points: number;
    type: "partner" | "social";
    status: "active" | "completed";
  };
}

export const TaskCard = ({ task }: TaskProps) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-bold">{task.name}</h3>
      <p className="text-gray-400 text-sm">{task.description}</p>
      <div className="flex justify-between items-center mt-4">
        <span className="text-green-400 font-bold">{task.points} Points</span>
        <Button variant="default">Complete</Button>
      </div>
    </div>
  );
};
