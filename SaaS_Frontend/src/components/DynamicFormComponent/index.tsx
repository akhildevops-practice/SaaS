import { templateForm } from "../../recoil/atom";
import { useRecoilState } from "recoil";
import ComponentGenerator from "../ComponentGenerator";
import { InputHandlerType } from "../../utils/enums";
import { Typography } from "@material-ui/core";
import { useStyles } from "./styles";
import Box from "@material-ui/core/Box";
import InfoIcon from "../../assets/icons/Info.svg";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import AttachIconGrey from "../../assets/icons/AttachIconGrey.svg";

type Props = {
  disabled?: boolean;
};

/**
 * @method DynamicFormComponent
 * @description Functional component which maps through the recoil form state and generates the dynamic form components
 * @param disabled {boolean}
 * @returns a react node
 */
const DynamicFormComponent = ({ disabled = true }: Props) => {
  const [template, setTemplate] = useRecoilState<any>(templateForm);
  const classes = useStyles();

  /**
   * @method handleChange
   * @description Function to handle changes on the textfield component
   * @param e {any}
   * @returns nothing
   */
  const handleChange = (e: any) => {
  };

  return (
    <Box
      display="flex"
      className={classes.rootContainer}
      flexDirection="column"
      gridGap={10}
    >
      <Box display="flex" flexDirection="column" gridGap={10}>
        {template.sections.map((item: any, index: number) => (
          <>
            <Box
              bgcolor="white"
              marginTop={3}
              p={"30px clamp(1rem, 70px, 2rem)"}
              borderTop={10}
              borderRadius={10}
              borderColor="primary.light"
            >
              <div className={classes.sectionHeader}>
                <Typography className={classes.text}>{index + 1}.</Typography>

                <Typography className={classes.text}>
                  <strong>{item.title}</strong>
                </Typography>
              </div>
            </Box>
            {item.fieldset.map((item: any, itemIndex: number) => (
              <div className={classes.questionContainer}>
                <div className={classes.questionHeader}>
                  <Typography className={classes.text}>
                    {index + 1}.{itemIndex + 1}
                  </Typography>
                  <Typography className={classes.text}>{item.title}</Typography>
                  <Tooltip title={item.hint} enterTouchDelay={0}>
                    <img src={InfoIcon} alt="info" />
                  </Tooltip>
                </div>
                <Box
                  display="flex"
                  bgcolor="white"
                  justifyContent="space-between"
                  gridGap={10}
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                    md: "center",
                  }}
                  flexDirection={{ xs: "column", sm: "row", md: "row" }}
                >
                  <div>
                    <ComponentGenerator
                      disabled={disabled}
                      type={item.inputType}
                      handler={handleChange}
                      inputHandlerType={
                        item.inputType === "numeric" && item.slider
                          ? InputHandlerType.SLIDER
                          : InputHandlerType.TEXT
                      }
                      numericData={
                        item.inputType === "numeric" && item.slider
                          ? item.score
                          : ""
                      }
                      radioData={
                        item.inputType === "radio" ||
                        item.inputType === "checkbox"
                          ? item.options
                          : ""
                      }
                    />
                  </div>
                  {item.allowImageUpload && (
                    <label htmlFor="contained-button-file">
                      <input
                        accept="image/*"
                        id="contained-button-file"
                        multiple
                        type="file"
                        style={{ display: "none" }}
                        disabled
                      />
                      <Button
                        variant="contained"
                        component="span"
                        size="large"
                        startIcon={<img src={AttachIconGrey} alt="" />}
                        style={{ position: "static" }}
                        disableElevation
                        disabled
                      >
                        Attach
                      </Button>
                    </label>
                  )}
                </Box>
              </div>
            ))}
          </>
        ))}
      </Box>
    </Box>
  );
};

export default DynamicFormComponent;
