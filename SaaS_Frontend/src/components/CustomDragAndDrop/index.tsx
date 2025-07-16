import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import { generateUniqueId } from "../../utils/uniqueIdGenerator";
import { useSnackbar } from "notistack";
import QuestionCard from "../QuestionCard";
import { useRecoilState } from "recoil";
import { questionFocus } from "../../recoil/atom";

type Props = {
  children?: React.ReactNode;
  index?: any;
  item?: any;
  setTemplate: any;
  addQuestion?: any;
  removeQuestion?: any;
  handleQuestionChange?: any;
  changeSelect?: (tag: string, index: number, questionIndex: number) => void;
};

/**
 * @method CustomDragAndDrop
 * @description Function which generates a custom drag and drop component
 * @param children {React.ReactNode}
 * @param index {any}
 * @param item {any}
 * @param setTemplate {any}
 * @param handleQuestionChange {any}
 * @param changeSelect {(tag: string, index: number, questionIndex: number) => void}
 * @returns a react node
 */
const CustomDragAndDrop = ({
  children,
  index,
  item,
  setTemplate,
  handleQuestionChange,
  changeSelect,
}: Props) => {
  const [names, setNames] = useState(item.fieldset);
  const [focus, setFocus] = useRecoilState<boolean>(questionFocus);
  const { enqueueSnackbar } = useSnackbar();

  /**
   * @method handleDragEnd
   * @description Function to handle changes in the custom drag and drop context when a component is dragged and dropped inside of it
   * @param result {any}
   * @returns nothing
   */
  function handleOnDragEnd(result: any) {
    if (!result.destination) return;
    const sectionData = JSON.parse(JSON.stringify(item));
    setTemplate((prev: any) => {
      const items = Array.from(item.fieldset);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      sectionData.fieldset = items;
      setNames(items);
      return {
        ...prev,
        sections: prev.sections.map((section: any, sectionIndex: number) => {
          if (index === sectionIndex) {
            return sectionData;
          }
          return section;
        }),
      };
    });
  }

  /**
   * @method addQuestion
   * @description Function to add a new question field in a particular section
   * @param index {any}
   * @returns nothing
   */
  const addQuestion = (index: any) => {
    let sectionData: any;
    setTemplate((prev: any) => {
      sectionData = JSON.parse(JSON.stringify(prev));
      sectionData.sections.splice(index, 1, {
        ...sectionData.sections[index],
        fieldset: [
          ...sectionData.sections[index].fieldset,
          {
            id: generateUniqueId(10),
            title: "",
            inputType: "numeric",
            options: [
              {
                name: "yes",
                checked: false,
                value: 0,
              },
              {
                name: "no",
                checked: false,

                value: 0,
              },
              {
                name: "na",
                checked: false,

                value: 0,
              },
            ],
            value: "",
            questionScore: 0,
            score: [
              {
                name: "gt",
                value: 0,
                score: 0,
              },
              {
                name: "lt",
                value: 0,
                score: 0,
              },
            ],
            slider: false,
            open: false,
            required: true,
            hint: "",
            allowImageUpload: true,
            image: "image url",
            imageName: "",
            nc: {
              type: "",
              comment: "",
              clause: "",
              severity: "",
            },
          },
        ],
      });
      return { ...sectionData };
    });
    setFocus(true);

    enqueueSnackbar("Question has been added!", { variant: "success" });
  };

  /**
   * @method removeQuestion
   * @description Function to remove a question field in a particular section based on the section index and question index
   * @param index {any}
   * @param questionIndex {any}
   * @returns nothing
   */
  const removeQuestion = (index: any, questionIndex: any) => {
    let sectionData: any;
    setTemplate((prev: any) => {
      sectionData = JSON.parse(JSON.stringify(prev));
      sectionData?.sections.splice(index, 1, {
        ...sectionData.sections[index],
        fieldset: sectionData.sections[index].fieldset.filter(
          (question: any, i: any) => i !== questionIndex
        ),
      });
      return { ...sectionData };
    });
    enqueueSnackbar("Question has been removed!", { variant: "error" });
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd!}>
      <Droppable droppableId="names">
        {(provided: any) => (
          <div
            className="container-style"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {item?.fieldset.map((questionItem: any, questionIndex: any) => (
              <Draggable
                draggableId={questionItem.id}
                key={questionItem.id}
                index={questionIndex}
              >
                {(provided: any) => (
                  <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    <QuestionCard
                      questionData={questionItem}
                      addQuestion={() => addQuestion(index)}
                      removeQuestion={() =>
                        item.fieldset.length > 1 &&
                        removeQuestion(index, questionIndex)
                      }
                      onChange={(e: any) =>
                        handleQuestionChange(e, index, questionIndex)
                      }
                      changeSelectOption={(tag: string) => {
                        let setTag: any;
                        if (tag === "n") setTag = "numeric";
                        if (tag === "t") setTag = "text";
                        if (tag === "c") setTag = "checkbox";
                        if (tag === "y") setTag = "radio";
                        changeSelect?.(setTag, index, questionIndex);
                      }}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default CustomDragAndDrop;
