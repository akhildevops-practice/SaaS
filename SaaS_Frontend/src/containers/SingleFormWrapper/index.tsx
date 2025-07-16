import { Button, Typography } from "@material-ui/core";
import React from "react";
import useStyles from "./styles";
import { useNavigate } from "react-router-dom";
import { MdChevronLeft } from 'react-icons/md';
import CustomButtonGroup from "../../components/CustomButtonGroup";

type Props = {
  redirectToTab?: string;
  parentPageLink: string;
  children: any;
  handleSubmit?: any;
  handleDiscard?: any;
  backBtn?: any;
  label?: any;
  splitButton?: boolean;
  options?: any;
  onSubmit?: any;
  disableOption?: any;
  disableFormFunction?: boolean;
  customButtonStyle?: any;
  handleSaveAsDraft?: any; // Add a prop for the Save as Draft function
  isScheduleInDraft?: boolean;
  isEdit?: boolean; // Add a prop to check if the schedule is in draft
  moduleName?: string;
};

function SingleFormWrapper({
  children,
  redirectToTab,
  parentPageLink,
  handleSubmit,
  handleDiscard,
  label,
  backBtn = true,
  splitButton = false,
  options,
  onSubmit,
  disableOption,
  disableFormFunction = false,
  customButtonStyle,
  handleSaveAsDraft, // Add a prop for the Save as Draft function
  isScheduleInDraft = false,
  isEdit = false, // Add a prop to check if the schedule is in draft
  moduleName = "",
}: Props) {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <div>
      <div className={classes.header}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Button
              data-testid="single-form-wrapper-button"
              onClick={() => {
                redirectToTab
                  ? navigate(parentPageLink, {
                      state: {
                        redirectToTab: redirectToTab,
                        retain: backBtn ? true : false,
                      },
                    })
                  : navigate(parentPageLink);
              }}
              className={backBtn ? classes.btnHide : classes.btn}
            >
              <MdChevronLeft fontSize="small" />
              Back
            </Button>
            <Typography variant="h6" style={{ padding: "2px 0 0 20px" }}>
              {label}
            </Typography>
          </div>
          {/* {!!moduleName && moduleName === "Audit Schedule" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "10px",
              }}
            >
              {!!isScheduleInDraft && !!isEdit && (
                <img
                  src={draftImage}
                  style={{ width: "100px", height: "42px", marginRight: "5px" }}
                  alt="Draft"
                />
              )}

              <Button
                size="small"
                variant="contained"
                style={{ marginRight: "10px", width: "fit-content" }}
                onClick={handleSaveAsDraft} // Use the Save as Draft handler
                className={classes.submitBtn}
                disabled={!isScheduleInDraft && isEdit} // Disable the button if the schedule is already in draft
              >
                Save as Draft
              </Button>
            </div>
          )} */}
        </div>
        {!disableFormFunction && (
          <div style={{ display: "flex" }}>
            <Button
              size="small"
              className={classes.discardBtn}
              onClick={() => {
                handleDiscard();
              }}
            >
              Discard
            </Button>
            {splitButton ? (
              <div className={classes.buttonGroup}>
                <CustomButtonGroup
                  options={options}
                  handleSubmit={onSubmit}
                  disableBtnFor={disableOption ? disableOption : []}
                  style={customButtonStyle}
                />
              </div>
            ) : (
              <Button
                variant="contained"
                size="small"
                data-testid="single-form-wrapper-submit-button"
                className={classes.submitBtn}
                onClick={() => {
                  handleSubmit();
                }}
              >
                Submit
              </Button>
            )}
          </div>
        )}
      </div>
      <div className={classes.formContainer}>{children}</div>
    </div>
  );
}

export default SingleFormWrapper;
