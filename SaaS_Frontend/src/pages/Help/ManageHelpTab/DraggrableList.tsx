import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MdDragHandle } from 'react-icons/md';
import { Theme, makeStyles } from "@material-ui/core";
import axios from "apis/axios.global";
import { MdDeleteForever } from 'react-icons/md';
import { useState } from "react";
import { useSnackbar } from "notistack";
import ConfirmDialog from "components/ConfirmDialog";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  item: {
    marginBottom: "15px",
    color: "#003566",
    fontWeight: 600,
    fontSize: "12px",
    letterSpacing: ".8px",
    transition: "text-decoration 0.3s", // Add transition effect for smooth animation
    "&:hover": {
      textDecoration: "underline", // Add underline on hover
    },
  },
  label: {
    color: "#003566",
    fontWeight: "bold",
    letterSpacing: "0.8px",
  }
}));

type Props = {
  selectedTopics: any;
  setSelectedTopics: any;
  topicSelected: any;
  setTopicSelected: any;
};
const DraggableList = ({ selectedTopics, setSelectedTopics, topicSelected, setTopicSelected }: Props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [deleteTopicIndex, setDeleteTopicIndex] = useState<any>()

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedTopics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    if (items.length > 0) {
      const payload = { "topicOrder": items.map((item: any) => item._id) }
      axios.put(`/api/moduleHelp/updateModule/${selectedTopics[0].moduleId}`, payload)
    }
    setSelectedTopics(items);
  };

  const getTopicDetails = (topic: any) => {
    setTopicSelected(topic)
  }

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteTopicIndex(val)
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    try {
      const deleteTopicId = selectedTopics[deleteTopicIndex]._id
      selectedTopics.splice(deleteTopicIndex, 1)
      await axios.delete(`/api/moduleHelp/deleteTopic/${deleteTopicId}`)
      enqueueSnackbar(`Deleted Successfully`, { variant: "success" });
      setSelectedTopics(selectedTopics)
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
    }
  };
  return (
    <>
      <label className={classes.label}>Topic Order List</label>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="topics">
          {(provided) => (
            <ul
              style={{ listStyle: "none" }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {selectedTopics.map((item: any, index: any) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={classes.item}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "5px", width: "400px" }} onClick={() => { getTopicDetails(item) }}>
                          <MdDragHandle />
                          {item.topic}
                        </div>
                        <div style={{ display: "flex", gap: "5px" }} onClick={() => { handleOpen(index) }}>
                          <MdDeleteForever />
                        </div>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
    </>
  );
};

export default DraggableList;
