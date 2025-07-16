import React, { useEffect } from "react";
import { Task, ViewMode, Gantt } from "gantt-task-react";
import { ViewSwitcher } from "../ViewSwitcher";
import { initTasks } from "./helper";
import "gantt-task-react/dist/index.css";
import axios from "../../apis/axios.global";

type Props = {
  fetchObjectives?: any;
  url?: any;
};

// Init
const GanttChart = ({ fetchObjectives, url }: Props) => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>(initTasks);
  const [isChecked, setIsChecked] = React.useState(false);
  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  useEffect(() => {
    fetchData();
  }, [url]);

  const fetchData = async () => {
    try {
      const response = await axios.get(url);
      console.log("fetchDataResponse", response?.data?.data, url);
      const data = response?.data?.data;

      const tblData = [];

      for (const obj of data) {
        const objectiveData = {
          start: new Date(),
          end: new Date(),
          name: "",
          id: obj._id,
          progress: 0,
          type: "",
          hideChildren: false,
          displayOrder: 1,
        };

        tblData.push(objectiveData);

        if (obj?.kra) {
          for (const child of obj.kra) {
            const startDate = child.StartDate
              ? new Date(child.StartDate)
              : new Date();
            const endDate = child.EndDate
              ? new Date(child.EndDate)
              : new Date();

            const kraData = {
              start: startDate,
              end: endDate,
              name: child.KraName,
              id: child._id,
              progress: 25,
              type: obj._id,
              hideChildren: false,
              displayOrder: 1,
            };

            tblData.push(kraData);
          }
        }
      }
      setTasks(tblData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitKra = async (values: any) => {
    const kraData = {
      _id: values.id,
      StartDate: values.start,
      EndDate: values.end,
    };
    putKra(kraData);
  };

  const putKra = async (data: any) => {
    try {
      const res = await axios.put(`/api/kra/updateKraById/${data._id}`, data);

      fetchObjectives(url);
    } catch (error) {
      console.log("error in post kra", error);
    }
  };

  const handleTaskChange = (task: Task) => {
    // let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
    const newTasks = tasks.map((t) => {
      return t.id === task.id ? task : t;
    });
    handleSubmitKra(task);
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {};

  const handleSelect = (task: Task, isSelected: boolean) => {};

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
  };

  return (
    <>
      {tasks && tasks?.length > 0 ? (
        <div className="Wrapper">
          <ViewSwitcher
            onViewModeChange={(viewMode) => setView(viewMode)}
            onViewListChange={setIsChecked}
            isChecked={isChecked}
          />
          <Gantt
            tasks={tasks}
            viewMode={view}
            onDateChange={handleTaskChange}
            onDelete={handleTaskDelete}
            onProgressChange={handleProgressChange}
            onDoubleClick={handleDblClick}
            onClick={handleClick}
            onSelect={handleSelect}
            onExpanderClick={handleExpanderClick}
            listCellWidth={""}
            columnWidth={columnWidth}
            rowHeight={47.5}
            headerHeight={45}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default GanttChart;
