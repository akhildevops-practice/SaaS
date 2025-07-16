import React from "react";
import { useStyles } from "./styles";
import Box from "@material-ui/core/Box";
import dragIcon from "../../assets/icons/drag.svg";
import upArrow from "../../assets/icons/upArrow.svg";
import downArrow from "../../assets/icons/downArrow.svg";
import addIcon from "../../assets/icons/add.svg";
import deleteIcon from "../../assets/icons/bin.svg";
import IconButton from "@material-ui/core/IconButton";
import TextFieldComponent from "../TextfieldComponent";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormFieldController from "../FormFieldController";
import Grid from "@material-ui/core/Grid";
import CustomAccordion from "../CustomAccordion";
import Collapse from "@material-ui/core/Collapse";
import HintQuestions from "../HintQuestions";
import { Tooltip } from "@material-ui/core";
import { MdKeyboardArrowDown } from 'react-icons/md';
import { questionFocus } from "../../recoil/atom";
import { useRecoilValue } from "recoil";
import { templateForm } from "../../recoil/atom";
import { useRecoilState } from "recoil";

type HintType = "text" | "number" | "radio" | "checkbox";

type Props = {
  questionData: any;
  addQuestion: () => void;
  removeQuestion: () => void;
  onChange: (e: any) => void;
  changeSelectOption?: (tag: string) => void;
  error?: boolean;
  errorText?: string;
};

/**
 * @method QuestionCard
 * @description Function to generate a question card component
 * @param questionData {any}
 * @param addQuestion {() => void}
 * @param removeQuestion {() => void}
 * @param onChange {(e: any) => void}
 * @param changeSelectOption {(tag: string) => void}
 * @returns
 */
const QuestionCard = ({
  questionData,
  addQuestion,
  removeQuestion,
  onChange,
  changeSelectOption,
}: Props) => {
  const classes = useStyles();
  const [isCollaped, setIsCollaped] = React.useState(true);
  const [hintValue, setHintValue] = React.useState<HintType>("text");
  const focus = useRecoilValue(questionFocus);
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const [checked, setChecked] = React.useState(true);
  const formData = useRecoilState(templateForm);

  /**
   * @method toggleCollapse
   * @description Function to handle collapse of the question card
   * @returns nothing
   */
  function toggleCollapse() {
    setIsCollaped(!isCollaped);
    setChecked(!checked);
  }

  /**
   * @method handleChange
   * @description Function to handle expansion of the settings accordion
   * @param panel {string}
   * @returns
   */
  const handleChange =
    (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleAdd = () => {
    addQuestion();
    toggleCollapse();
  };

  return (
    <Tooltip title="Grab the question card to drag and drop">
      <Box
        className={classes.rootContainer}
        border={1}
        borderColor="primary.main"
        onKeyDown={(e: any) => {
          if (
            e.key === "n" ||
            e.key === "c" ||
            e.key === "y" ||
            e.key === "t"
          ) {
            changeSelectOption?.(e.key);
          }
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={1}
        >
          <Box display={{ xs: "none", sm: "none", md: "block" }} flex={1}></Box>

          <Box
            flex={1}
            display="flex"
            justifyContent={{
              xs: "flex-start",
              sm: "flex-start",
              md: "center",
            }}
          >
            <IconButton className={classes.dragIcon} disableRipple={true}>
              <img src={dragIcon} alt="drag icon" />
            </IconButton>
          </Box>

          <Box display="flex" justifyContent="flex-end" gridGap={2} flex={1}>
            <Tooltip title="Add Question">
              <IconButton data-testid="add-question-button" onClick={handleAdd}>
                <img src={addIcon} alt="add icon" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Question">
              <IconButton onClick={removeQuestion}>
                <img src={deleteIcon} alt="delete icon" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isCollaped ? "Close Section" : "Expand Section"}>
              <IconButton
                data-testid="collapse-button"
                onClick={toggleCollapse}
              >
                {isCollaped ? (
                  <img src={upArrow} alt="up arrow" draggable={false} />
                ) : (
                  <img src={downArrow} alt="down arrow" draggable={false} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Collapse in={checked} collapsedSize={110}>
          <div className={classes.questionContainer}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box pb={!checked ? 4 : 0}>
                  <TextFieldComponent
                    onChange={onChange}
                    label="Question"
                    type="text"
                    name="title"
                    autoFocus={focus}
                    value={questionData.title}
                  />
                </Box>
              </Grid>

              {isCollaped && (
                <>
                  {formData[0].status === false ? (
                    <Grid item xs={12}>
                      <FormFieldController label="Type">
                        <Select
                          onChange={onChange}
                          name="inputType"
                          value={questionData.inputType}
                          variant="outlined"
                          className={classes.select}
                          IconComponent={MdKeyboardArrowDown}
                        >
                          <MenuItem value="checkbox">Checkbox</MenuItem>
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="numeric">Numeric</MenuItem>
                          <MenuItem value="radio">Yes/No/NA</MenuItem>
                        </Select>
                      </FormFieldController>
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <FormFieldController label="Type">
                        <Select
                          onChange={onChange}
                          name="inputType"
                          value={questionData.inputType}
                          variant="outlined"
                          className={classes.select}
                          IconComponent={MdKeyboardArrowDown}
                        >
                          <MenuItem value="text">Text</MenuItem>
                        </Select>
                      </FormFieldController>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <CustomAccordion
                      name="Settings"
                      panel="panel1"
                      expanded={expanded}
                      handleChange={handleChange}
                      border={false}
                    >
                      <HintQuestions
                        onChange={onChange}
                        hintData={questionData}
                        questionType={questionData.inputType}
                      />
                    </CustomAccordion>
                  </Grid>
                </>
              )}
            </Grid>
          </div>
        </Collapse>
      </Box>
    </Tooltip>
  );
};

export default QuestionCard;
