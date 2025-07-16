import React, { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import useStyles from "./styles";
import IconButton from "@material-ui/core/IconButton";
import { MdCheckCircle } from 'react-icons/md';
import { MdCancel } from 'react-icons/md';
import {
  auditCreationForm,
  auditFormData,
  tempClauses,
} from "../../recoil/atom";
import InfoIcon from "../../assets/icons/Info.svg";

import { useRecoilState, useSetRecoilState } from "recoil";
import { Autocomplete } from "@material-ui/lab";
import {
  Button,
  Checkbox,
  InputAdornment,
  TextareaAutosize,
  Tooltip,
  useMediaQuery,
} from "@material-ui/core";
import { MdSearch } from 'react-icons/md';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import { useTheme } from "@material-ui/core/styles";
import checkRole from "../../utils/checkRoles";
// import axios from "axios";
import axios from "apis/axios.global";
import { getAllClauses } from "apis/clauseApi";

type Props = {
  sectionIndex?: any;
  questionIndex?: any;
  closeCard?: any;
  checkListIndex?: any;
  status?: any;
  auditTypeId?: any;
  refForReportForm17?: any;
  refForReportForm18?: any;
  refForReportForm19?: any;
  refForReportForm20?: any;
  impactType?: any;
};

/**
 * @description Functional component which returns an nc card
 * @param sectionIndex {any}
 * @param questionIndex {any}
 * @returns a react node
 */
export default function NcCard({
  sectionIndex,
  questionIndex,
  checkListIndex,
  closeCard,
  auditTypeId,
  status = false,
  refForReportForm17,
  refForReportForm18,
  refForReportForm19,
  impactType,
  refForReportForm20,
}: Props) {
  const classes = useStyles();
  const [type, setType] = useState<any>();
  const [ncData, setNcData] = useRecoilState<any>(auditCreationForm);
  const [auditInfo, setAuditInfo] = useRecoilState<any>(auditFormData);
  const [open, setOpen] = useState(false);
  const setTempClauses = useSetRecoilState(tempClauses);
  const [clauses, setClauses] = useState<any>([]);
  const [allClauses, setAllClause] = useState<any>([]);

  const [autoCompleteKey, setAutoCompleteKey] = useState(1);
  const [currentClause, setCurrentClause] = useState<any>(
    ncData[checkListIndex].sections[sectionIndex].fieldset[questionIndex].nc
      .clause
  );
  const [commentData, setCommentData] = useState<any>(
    ncData[checkListIndex].sections[sectionIndex].fieldset[questionIndex].nc
      .comment
  );
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isAuditor = checkRole("AUDITOR");
  const isLocAdmin = checkRole("LOCATION-ADMIN");
  const [optionData, setOptionData] = useState([]);
  useEffect(() => {
    parseClauses(auditInfo.auditedClauses);
  }, []);

  useEffect(() => {
    setTempClauses(clauses);
  }, [clauses]);
  useEffect(() => {
    getOptionData();
    fetchAllClauses();
  }, []);


  const fetchAllClauses = () => {
    const data = auditInfo.system;
    const selectedClauses = auditInfo.auditedClauses.map(
      (value: any) => value.item.id
    );
    if (selectedClauses?.includes("All")) {
      getAllClauses(`${data}`).then((response: any) => {
        // Check if response.data is an array before mapping
        const mappedData: any = response.data.map((item: any) => ({
          id: item.id,
          clauseName: item.name,
          clauseNumber: item.number,
        }));

        setAllClause(mappedData);
      });
    } else {
      auditInfo.auditedClauses.map((item: any) => {
        setAllClause((prev: any) => {
          return [
            ...prev,
            {
              id: item?.item?.id,
              clauseName: item?.item?.name,
              clauseNumber: item?.item?.number,
            },
          ];
        });
      });
    }
  };
  /**
   * @method handleChange
   * @description Function to handle input changes inside the nc card field and store it in the recoil state
   * @param e {any}
   * @returns nothing
   */
  const getOptionData = async () => {
    try {
      const res = await axios.get(
        `/api/audit-settings/getAuditReportOptionData/${auditTypeId}`
      );
      const data = res.data.map((value: any) => {
        return {
          findingType: value.findingType,
          findingTypeId: value.findingTypeId,
          selectClause: value.selectClause,
          comments: value.comments,
        };
      });
      setOptionData(data);
    } catch (error) {}
  };

  const handleChange = (e: any) => {
    const dataCopy = JSON.parse(JSON.stringify(ncData));
    if (e.target.name === "type") {
      // setNcData((prev: any) => {
      //   let copyData = JSON.parse(JSON.stringify(ncData));
      //   copyData.sections[sectionIndex].fieldset[questionIndex].nc = {
      //     ...copyData.sections[sectionIndex].fieldset[questionIndex].nc,
      //     type: "Observation",
      //     clause: "",
      //     severity: "",
      //   };
      //   return copyData;
      // });
      const selectedOptionData: any = optionData.filter(
        (value: any) => value?.findingType === e.target.value
      );
      dataCopy[checkListIndex].sections[sectionIndex].fieldset[
        questionIndex
      ].nc["type"] = e.target.value;
      dataCopy[checkListIndex].sections[sectionIndex].fieldset[
        questionIndex
      ].nc["statusClause"] = selectedOptionData[0].selectClause;

      dataCopy[checkListIndex].sections[sectionIndex].fieldset[
        questionIndex
      ].nc["statusComments"] = selectedOptionData[0].comments;

      dataCopy[checkListIndex].sections[sectionIndex].fieldset[
        questionIndex
      ].nc["findingTypeId"] = selectedOptionData[0].findingTypeId;

      setNcData(dataCopy);
      // dataCopy.sections[sectionIndex].fieldset[questionIndex].nc.statusClause =
      // true;
      // setNcData(dataCopy);
    } else {
      dataCopy[checkListIndex].sections[sectionIndex].fieldset[
        questionIndex
      ].nc[e.target.name] = e.target.value;
      setNcData(dataCopy);
    }
  };

  /**
   * @method handleDiscard
   * @description Function to remove data from all fields inside the nc card.
   * @returns nothing
   */
  const handleDiscard = () => {
    setNcData((prev: any) => {
      const copyData = JSON.parse(JSON.stringify(ncData));
      copyData[checkListIndex].sections[sectionIndex].fieldset[
        questionIndex
      ].nc = {
        type: "",
        comment: "",
        clause: "",
        findingTypeId: "",
        // severity: "",
      };
      return copyData;
    });

    setCommentData("");
    closeCard?.();
  };

  /**
   * @method handleSubmit
   * @description Function to submit NC/Observation values
   * @returns nothing
   */
  const handleSubmit = () => {
    closeCard?.();
  };

  /**
   * @method handleKeyDownChange
   * @description Function to handle key down events
   * @returns nothing
   */
  const handleKeyDownChange = (key: string) => {
    if (key === "o") {
      setNcData((prev: any) => {
        const copyData = JSON.parse(JSON.stringify(ncData));
        copyData[checkListIndex].sections[sectionIndex].fieldset[
          questionIndex
        ].nc = {
          ...copyData[checkListIndex].sections[sectionIndex].fieldset[
            questionIndex
          ].nc,
          type: "Observation",
        };
        return copyData;
      });
    } else if (key === "n") {
      setNcData((prev: any) => {
        const copyData = JSON.parse(JSON.stringify(ncData));
        copyData[checkListIndex].sections[sectionIndex].fieldset[
          questionIndex
        ].nc = {
          ...copyData[checkListIndex].sections[sectionIndex].fieldset[
            questionIndex
          ].nc,
          type: "NC",
        };
        return copyData;
      });
    }
  };

  /**
   * @method handleCommentChange
   * @description Function to handle changes in comment field
   * @param e {any}
   * @returns nothing
   */
  const handleCommentChange = (e: any) => {
    setCommentData(e.target.value);
  };

  /**
   * @method handleClauseChange
   * @description Function to handle clause change
   * @param sectionIndex {any}
   * @param questionIndex {any}
   * @param value {any}
   * @returns nothing
   */
  const handleClauseChange = (
    sectionIndex: any,
    questionIndex: any,
    value: any
  ) => {
    const dataCopy = JSON.parse(JSON.stringify(ncData));
    setCurrentClause(value);
    setNcData((prev: any) => {
      dataCopy[checkListIndex].sections[sectionIndex].fieldset[
        questionIndex
      ].nc.clause = value;
      return dataCopy;
    });
  };

  /**
   * @method handleOpen
   * @description Function to open the dialog box
   * @returns nothing
   */
  const handleOpen = () => {
    setOpen(true);
  };

  /**
   * @method handleClose
   * @description Function to close the dialog box
   * @returns nothing
   */
  const handleClose = () => {
    setOpen(false);
  };

  /**
   * @method parseClauses
   * @description Function to parse clause data and segregate it for performing operations
   * @param data {any}
   * @returns nothing
   */
  const parseClauses = (data: any) => {
    data.map((item: any) => {
      setClauses((prev: any) => {
        return [
          ...prev,
          {
            id: item?.item?.id,
            clauseName: item?.item?.name,
            clauseNumber: item?.item?.number,
          },
        ];
      });
    });
  };

  return (
    <div>
      <div className={classes.ncCard}>
        <div className={classes.cardHeader}>
          <Typography variant="body2">NC/Observation</Typography>
        </div>
        <div className={classes.cardBody}>
          <Grid container>
            <Grid item sm={12} md={6}>
              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>Type</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                    onKeyDown={(e: any) => handleKeyDownChange(e.key)}
                  >
                    <InputLabel>Type</InputLabel>
                    <Select
                      label="Type"
                      value={
                        ncData[checkListIndex].sections[sectionIndex].fieldset[
                          questionIndex
                        ].nc.type
                      }
                      onChange={handleChange}
                      name="type"
                      data-testid="systemType"
                      required
                      ref={refForReportForm17}
                    >
                      {optionData.map((value: any) => (
                        <MenuItem key={value._id} value={value.findingType}>
                          {value.findingType}
                        </MenuItem>
                      ))}
                      {/* <MenuItem value="NC">NC</MenuItem>
                      <MenuItem value="Observation">Observation</MenuItem>
                      <MenuItem value="OFI">OFI</MenuItem> */}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* new body to test */}
              <Grid container>
                {impactType.length > 0 && (
                  <>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      className={classes.formTextPadding}
                    >
                      <strong>Impact Type</strong>
                    </Grid>
                    <Grid item sm={12} md={8} className={classes.formBox}>
                      <FormControl
                        className={classes.formControl}
                        variant="outlined"
                        size="small"
                        onKeyDown={(e: any) => handleKeyDownChange(e.key)}
                      >
                        {/* <Autocomplete
                          options={impactType}
                          getOptionLabel={(option) => option.name}
                          getOptionSelected={(option, value) =>
                            option.id === value.id
                          }
                          value={
                            ncData[checkListIndex].sections[sectionIndex]
                              .fieldset[questionIndex]?.nc?.impactType || null
                          }
                          onChange={(event, newValue) =>
                            handleChange({
                              target: {
                                name: "impactType",
                                value: newValue,
                              },
                            })
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Type"
                              data-testid="systemType"
                              required
                              inputRef={refForReportForm17}
                            />
                          )}
                        /> */}
                        <Autocomplete
                          ref={refForReportForm18}
                          disabled={
                            ncData[checkListIndex]?.sections[sectionIndex]
                              .fieldset[questionIndex]?.nc?.type ===
                            "Observation$&*[]jhabsjdbjhabdjasdbas"
                              ? true
                              : ncData[checkListIndex].sections[sectionIndex]
                                  .fieldset[questionIndex].nc.type ===
                                "Observation$&*[]jhabsjdbjhabdjasdbas"
                              ? true
                              : false
                          }
                          fullWidth
                          id="combo-box-demo"
                          options={impactType}
                          size="small"
                          value={
                            ncData[checkListIndex].sections[sectionIndex]
                              .fieldset[questionIndex]?.nc?.impactType || null
                          }
                          // clearOnBlur={true}
                          // clearOnEscape={true}
                          onChange={(e: any, newValue: any) => {
                            handleChange({
                              target: {
                                name: "impactType",
                                value: newValue,
                              },
                            });
                          }}
                          getOptionLabel={(option) => option?.name}
                          getOptionSelected={(option, value) =>
                            option?.id === value?.id
                          }
                          renderInput={(params) => (
                            <TextField
                              key={autoCompleteKey}
                              {...params}
                              InputProps={{
                                ...params.InputProps,
                                // startAdornment: (
                                //   <InputAdornment position="start">
                                //     <MdSearch
                                //       style={{ fontSize: 18, paddingLeft: 5 }}
                                //     />
                                //   </InputAdornment>
                                // ),
                              }}
                              // placeholder={
                              //   currentClause?.[checkListIndex]?.clauseName ??
                              //   "Select a clause"
                              // }
                              variant="outlined"
                              size="small"
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>

              <Grid container>
                <Grid item sm={12} md={4} className={classes.formTextPadding}>
                  <strong>High Priority</strong>
                </Grid>
                <Grid item sm={12} md={8} className={classes.formBox}>
                  <Checkbox
                    checked={
                      ncData[checkListIndex].sections[sectionIndex].fieldset[
                        questionIndex
                      ].nc.highPriority
                    }
                    onChange={(e) => {
                      const event = {
                        target: {
                          name: "highPriority",
                          value: e.target.checked, // Checked state as value
                        },
                      };
                      handleChange(event);
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Tooltip
              title={
                ncData[checkListIndex].sections[sectionIndex].fieldset[
                  questionIndex
                ].nc.statusComments
              }
              enterTouchDelay={0}
              style={{
                // alignItems: "flex-start",
                padding: theme.typography.pxToRem(10),
                height: "40px",
              }}
            >
              <img src={InfoIcon} alt="info" />
            </Tooltip>
            {/* <Grid item xs={12} md={1}></Grid> */}

            <Grid item sm={12} md={5}>
              <Grid container>
                {ncData[checkListIndex].sections[sectionIndex].fieldset[
                  questionIndex
                ].nc.statusClause ? (
                  <>
                    <Grid
                      item
                      sm={12}
                      md={4}
                      className={classes.formTextPadding}
                    >
                      <strong>Reqmnt</strong>
                    </Grid>
                    <Grid item sm={12} md={8} className={classes.formBox}>
                      <Autocomplete
                        ref={refForReportForm18}
                        disabled={
                          ncData[checkListIndex].sections[sectionIndex]
                            .fieldset[questionIndex].nc.type ===
                          "Observation$&*[]jhabsjdbjhabdjasdbas"
                            ? true
                            : ncData[checkListIndex].sections[sectionIndex]
                                .fieldset[questionIndex].nc.type ===
                              "Observation$&*[]jhabsjdbjhabdjasdbas"
                            ? true
                            : false
                        }
                        fullWidth
                        id="combo-box-demo"
                        options={allClauses}
                        size="small"
                        value={currentClause}
                        clearOnBlur={true}
                        clearOnEscape={true}
                        onChange={(e: any, value: any) => {
                          handleClauseChange(
                            sectionIndex,
                            questionIndex,
                            value
                          );
                        }}
                        getOptionLabel={(option) => option?.clauseName || ""}
                        
                        renderInput={(params) => (
                          <TextField
                            key={autoCompleteKey}
                            {...params}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MdSearch
                                    style={{ fontSize: 18, paddingLeft: 5 }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            placeholder={
                              currentClause?.[checkListIndex]?.clauseName ??
                              "Select a clause"
                            }
                            variant="outlined"
                            size="small"
                          />
                        )}
                      />
                    </Grid>
                  </>
                ) : (
                  ""
                )}
                {/* new body */}
                {impactType.length > 0 && (
                  <>
                    {" "}
                    <Grid
                      item
                      sm={12}
                      md={4}
                      className={classes.formTextPadding}
                    >
                      <strong>Impact</strong>
                    </Grid>
                    <Grid item sm={12} md={8} className={classes.formBox}>
                      <FormControl
                        className={classes.formControl}
                        variant="outlined"
                        size="small"
                        onKeyDown={(e: any) => handleKeyDownChange(e.key)}
                      >
                        {/* <InputLabel>Impact Type</InputLabel> */}
                        <Select
                          label="Type"
                          value={
                            ncData[checkListIndex].sections[sectionIndex]
                              .fieldset[questionIndex]?.nc?.impact || []
                          }
                          onChange={handleChange}
                          name="impact"
                          data-testid="systemType"
                          multiple
                          required
                          ref={refForReportForm17}
                        >
                          {ncData[checkListIndex]?.sections[
                            sectionIndex
                          ]?.fieldset[
                            questionIndex
                          ]?.nc?.impactType?.impact?.map((value: any) => (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          ))}
                          {/* <MenuItem value="NC">NC</MenuItem>
                      <MenuItem value="Observation">Observation</MenuItem>
                      <MenuItem value="OFI">OFI</MenuItem> */}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container>
                <Grid item sm={12} md={2} className={classes.formTextPadding}>
                  <strong>Comment</strong>
                </Grid>
                <Grid item sm={12} md={10} className={classes.formBox}>
                  <TextareaAutosize
                    // fullWidth
                    // multiline
                    style={{
                      width: "100%",
                    }}
                    minRows={4}
                    name="comment"
                    value={
                      // ncData[checkListIndex].sections[sectionIndex].fieldset[
                      //   questionIndex
                      // ].nc.comment
                      //   ? ncData[checkListIndex].sections[sectionIndex]
                      //       .fieldset[questionIndex].nc.comment
                      //   :
                      commentData
                    }
                    // variant="outlined"
                    onBlur={handleChange}
                    onChange={handleCommentChange}
                    // size="small"
                    // inputProps={{
                    //   "data-testid": "user-name",
                    // }}
                    disabled={status}
                    ref={refForReportForm19}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <div className={classes.buttonGroup} ref={refForReportForm20}>
            <IconButton onClick={handleSubmit} className={classes.successBtn}>
              <MdCheckCircle />
            </IconButton>
            <IconButton onClick={handleOpen} className={classes.errorBtn}>
              <MdCancel />
            </IconButton>
          </div>
          <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
          >
            <DialogContent>
              <DialogContentText>
                Do you want to remove the NC/Observation details?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={handleClose} color="primary">
                No
              </Button>
              <Button
                disabled={!isLocAdmin}
                onClick={() => {
                  handleDiscard();
                  handleClose();
                }}
                color="primary"
                autoFocus
              >
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
