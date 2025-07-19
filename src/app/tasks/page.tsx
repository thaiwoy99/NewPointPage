"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/TaskList";
//import { Navbar } from "@/components/Navbar";
import { UserStats } from "@/components/UserStats";

export default function TasksPage() {
  // State for filtering (e.g., Partner vs. Social Tasks)
  const [taskType, setTaskType] = useState<"partner" | "social">("partner");

  return (
    <div className="min-h-screen bg-gray-900  text-white">
      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section className="px-6 py-10 text-center">
        <h1 className="text-3xl font-bold">Complete Tasks & Earn Rewards</h1>
        <p className="text-gray-400 mt-2">
          Earn points by completing social and partner tasks.
        </p>

        {/* Task Type Toggle */}
        <div className="mt-6 flex justify-center gap-4">
          <Button
            variant={taskType === "partner" ? "default" : "outline"}
            onClick={() => setTaskType("partner")}
          >
            Partner Tasks
          </Button>
          <Button
            variant={taskType === "social" ? "default" : "outline"}
            onClick={() => setTaskType("social")}
          >
            Social Tasks
          </Button>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-6 pb-12">
        {/* Task List (Takes 3 columns on larger screens) */}
        <div className="md:col-span-3">
          <TaskList taskType={taskType} />
        </div>

        {/* Sidebar (User Stats) */}
        <div className="hidden md:block">
          <UserStats />
        </div>
      </div>
    </div>
  );
}
