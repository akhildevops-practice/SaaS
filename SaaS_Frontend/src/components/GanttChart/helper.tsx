// import { Task } from "../../dist/types/public-types";

import { Task } from "gantt-task-react";

export function initTasks() {
  const currentDate = new Date();
  const tasks: Task[] = [
    // {
    //   start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    //   end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    //   name: "OBJ001",
    //   id: "ProjectSample",
    //   progress: 25,
    //   type: "project",
    //   hideChildren: false,
    //   displayOrder: 1,
    // },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        2,
        12,
        28
      ),
      name: "KRA01",
      id: "Task 0",
      progress: 45,
      type: "task",
      project: "ProjectSample",
      displayOrder: 2,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
      name: "KRA02",
      id: "Task 1",
      progress: 25,
      // dependencies: ["Task 0"],
      type: "task",
      project: "ProjectSample",
      displayOrder: 3,
    },
  ];
  return tasks;
}

export function getStartEndDateForProject(tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter((t) => t.project === projectId);
  let start = projectTasks[0].start;
  let end = projectTasks[0].end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if (start.getTime() > task.start.getTime()) {
      start = task.start;
    }
    if (end.getTime() < task.end.getTime()) {
      end = task.end;
    }
  }
  return [start, end];
}
