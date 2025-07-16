import React from "react";
import Grid from "@material-ui/core/Grid";
import TextFieldComponent from "../TextfieldComponent";
import useStyles, { NumberTextField, ScoreTextField } from "./style";
import Box from "@material-ui/core/Box";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { MdChevronRight } from 'react-icons/md';
import { MdChevronLeft } from 'react-icons/md';
import { MdDragHandle } from 'react-icons/md';
import { Typography } from "@material-ui/core";
import { MdKeyboardArrowDown } from 'react-icons/md';

type Props = {
  questionType: "text" | "checkbox" | "radio" | "numeric";
  hintData?: any;
  onChange?: (e: any) => void;
};

/**
 * @method HintQuestion
 * @param questionType {"text" | "checkbox" | "radio" | "numeric"}
 * @param hintData {any}
 * @param onChange {(e: any) => void}
 * @returns nothing
 */
export default function HintQuestions({
  questionType,
  hintData,
  onChange,
}: Props) {
  const classes = useStyles();
  const [slider, setSlider] = React.useState();

  return (
    <Box p={1}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TextFieldComponent
            label="Hint Question"
            type="text"
            name="hint"
            value={hintData.hint}
            onChange={onChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row", md: "row" }}
            gridRowGap={10}
            alignItems="flex-start"
          >
            <Typography className={classes.label}>Score</Typography>
            <Box
              width="100%"
              display="flex"
              gridGap={25}
              flexWrap="wrap"
              flexDirection={{ xs: "column", sm: "row" }}
            >
              {questionType === "numeric" && (
                <>
                  <Box
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                    gridGap={10}
                  >
                    <Select
                      labelId="demo-simple-select-outlined-label"
                      name="score-0"
                      value={hintData.score[0].name}
                      id="demo-simple-select-outlined"
                      variant="outlined"
                      onChange={onChange}
                      className={classes.select}
                      IconComponent={MdKeyboardArrowDown}
                    >
                      <MenuItem value="gt">
                        <MdChevronRight />
                      </MenuItem>
                      <MenuItem value="lt">
                        <MdChevronLeft />
                      </MenuItem>
                      <MenuItem value="eq">
                        <MdDragHandle />
                      </MenuItem>
                      <MenuItem value="abs">
                        ABS
                      </MenuItem>
                    </Select>
                    {hintData.score[0].name !== 'abs' ? (
                      <>
                        <NumberTextField
                          data-testid="number-text-field"
                          name="value-0"
                          onChange={onChange}
                          value={hintData.score[0].value}
                          error={(hintData.score[0].value > 10 ||
                            hintData.score[0].value < 0) &&
                            hintData.slider}
                          helperText={(hintData.score[0].value > 10 ||
                            hintData.score[0].value < 0) &&
                            hintData.slider
                            ? "Value must be between 0 and 10"
                            : ""}
                          variant="outlined"
                          onKeyDown={(e: any) => {
                            e.stopPropagation();
                          }} 
                        />
                        <p>=</p>
                        <ScoreTextField
                          data-testid="score-text-field"
                          name="scoreVal-0"
                          onChange={onChange}
                          className={classes.scoreContainer}
                          value={hintData.score[0].score}
                          onKeyDown={(e: any) => {
                            e.stopPropagation();
                          } } 
                        />
                      </>
                    ) : (
                      <>
                        <p>ABS MIN</p>
                        <NumberTextField
                          data-testid="number-text-field"
                          name="value-0"
                          onChange={onChange}
                          value={hintData.score[0].value}
                          variant="outlined"
                          onKeyDown={(e: any) => {
                            e.stopPropagation();
                          }} 
                        />
                        <ScoreTextField
                          data-testid="score-text-field"
                          name="scoreVal-0"
                          onChange={onChange}
                          className={classes.scoreContainer}
                          value={hintData.score[0].value}
                          disabled={true}
                          onKeyDown={(e: any) => {
                            e.stopPropagation();
                          } } 
                          style={{display : 'none'}}
                        />
                      </>
                    )}
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                    gridGap={10}
                  >
                    {hintData.score[0].name !== "abs" ? (
                      <>
                      <Select
                        labelId="demo-simple-select-outlined-label"
                        name="score-1"
                        value={hintData.score[1].name}
                        onChange={onChange}
                        id="demo-simple-select-outlined"
                        variant="outlined"
                        className={classes.select}
                        IconComponent={MdKeyboardArrowDown}
                      >
                        <MenuItem value="gt">
                          <MdChevronRight />
                        </MenuItem>
                        <MenuItem value="lt">
                          <MdChevronLeft />
                        </MenuItem>
                        <MenuItem value="eq">
                          <MdDragHandle />
                        </MenuItem>
                      </Select>
                    <NumberTextField
                      data-testid="number-text-field-2"
                      name="value-1"
                      onChange={onChange}
                      // autoFocus={true}
                      value={hintData.score[1].value}
                      variant="outlined"
                      error={
                        (hintData.score[1].value > 10 ||
                          hintData.score[1].value < 0) &&
                        hintData.slider
                      }
                      helperText={
                        (hintData.score[1].value > 10 ||
                          hintData.score[1].value < 0) &&
                        hintData.slider
                          ? "Value must be between 0 and 10"
                          : ""
                      }
                      onKeyDown={(e: any) => {
                        e.stopPropagation();
                      }}
                    />
                    <p>=</p>
                    <ScoreTextField
                      data-testid="score-text-field-2"
                      name="scoreVal-1"
                      onChange={onChange}
                      className={classes.scoreContainer}
                      value={hintData.score[1].score}
                      onKeyDown={(e: any) => {
                        e.stopPropagation();
                      }}
                    />
                    </>
                    ) : (
                      <>
                        <p>ABS MAX</p>
                        <NumberTextField
                          data-testid="number-text-field-2"
                          name="value-1"
                          onChange={onChange}
                          // autoFocus={true}
                          value={hintData.score[1].value}
                          variant="outlined"
                          onKeyDown={(e: any) => {
                            e.stopPropagation();
                          }}
                        />
                        <ScoreTextField
                          data-testid="score-text-field-2"
                          name="scoreVal-1"
                          onChange={onChange}
                          className={classes.scoreContainer}
                          value={hintData.score[1].value}
                          disabled = {true}
                          onKeyDown={(e: any) => {
                            e.stopPropagation();
                          }}
                          style={{display : 'none'}}
                        />
                      </>
                    )}
                  </Box>
                </>
              )}

              {questionType === "radio" && (
                <Box
                  display="flex"
                  gridGap={20}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Box display="flex" gridGap={10} alignItems="center">
                    <Typography className={classes.text}>Yes</Typography>
                    <ScoreTextField
                      data-testid="radio-score-field-2"
                      name="yes"
                      onChange={onChange}
                      value={hintData.options[0].value}
                      className={classes.scoreContainer}
                      onKeyDown={(e: any) => {
                        e.stopPropagation();
                      }}
                    />
                  </Box>
                  <Box display="flex" gridGap={10} alignItems="center">
                    <Typography className={classes.text}>No</Typography>
                    <ScoreTextField
                      data-testid="radio-score-field-3"
                      name="no"
                      onChange={onChange}
                      className={classes.scoreContainer}
                      value={hintData.options[1].value}
                      onKeyDown={(e: any) => {
                        e.stopPropagation();
                      }}
                    />
                  </Box>
                  <Box display="flex" gridGap={10} alignItems="center">
                    <Typography className={classes.text}>NA</Typography>
                    <ScoreTextField
                      data-testid="radio-score-field-4"
                      name="na"
                      onChange={onChange}
                      className={classes.scoreContainer}
                      value={hintData.options[2].value}
                      onKeyDown={(e: any) => {
                        e.stopPropagation();
                      }}
                    />
                  </Box>
                </Box>
              )}

              {questionType === "checkbox" && (
                <Box display="flex" gridGap={20} alignItems="center">
                  <Box display="flex" gridGap={10} alignItems="center">
                    <Typography className={classes.text}>Yes</Typography>
                    <ScoreTextField
                      data-testid="checkbox-score-field"
                      name="yes"
                      value={hintData.options[0].value}
                      className={classes.scoreContainer}
                      onChange={onChange}
                      onKeyDown={(e: any) => {
                        e.stopPropagation();
                      }}
                    />
                  </Box>
                  <Box display="flex" gridGap={10} alignItems="center">
                    <Typography className={classes.text}>No</Typography>
                    <ScoreTextField
                      data-testid="checkbox-score-field-2"
                      name="no"
                      value={hintData.options[1].value}
                      className={classes.scoreContainer}
                      onChange={onChange}
                      onKeyDown={(e: any) => {
                        e.stopPropagation();
                      }}
                    />
                  </Box>
                </Box>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    name="allowImageUpload"
                    checked={hintData.allowImageUpload}
                    onChange={onChange}
                    color="primary"
                  />
                }
                label="Allow image upload"
              />
              {questionType === "numeric" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      data-testid="radio-checkbox"
                      name="slider"
                      checked={hintData.slider}
                      onChange={onChange}
                      color="primary"
                    />
                  }
                  label="Slider"
                />
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
