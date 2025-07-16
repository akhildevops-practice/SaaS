import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { Fab, Tooltip } from "@material-ui/core";
import { MdArrowUpward } from 'react-icons/md';
import { useStyles } from "./styles";
import CustomButtonGroup from "../../components/CustomButtonGroup";

type TemplateFormWrapperProps = {
  children: React.ReactElement;
  backPath?: string;
  onSubmit?: (option: string) => void;
  disableOption?: any;
  options?: any;
  redirectToTab?: string;
  parentPageLink: string;
  backBtn?: any;
};

/**
 * @method TemplateFormWrapper
 * @description Function to render the back button and template operation handling button
 * @param children {React.ReactElement}
 * @param backPath {string}
 * @param onSubmit {(option: string) => void}
 * @param disableOption {any}
 * @param options {any}
 * @returns nothing
 */
const TemplateFormWrapper = ({
  children,
  backPath,
  onSubmit,
  disableOption,
  options,
  redirectToTab,
  parentPageLink,
  backBtn,
}: TemplateFormWrapperProps) => {
  const [visible, setVisible] = React.useState(false);
  const classes = useStyles();
  const navigate = useNavigate();
  /**
   * @method scrollToTop
   * @description Function for scrolling to top of the page
   * @returns nothing
   */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /**
   * @method toggleVisible
   * @description Function to toggle the visibility of the scroll to top button
   * @returns nothing
   */
  const toggleVisible = () => {
    const scrolled = document?.documentElement?.scrollTop;
    if (scrolled > 300) {
      setVisible(true);
    } else if (scrolled <= 300) {
      setVisible(false);
    }
  };

  //Event listener for setting up the scroll to top feature
  window.addEventListener("scroll", toggleVisible);

  return (
    <div>
      <Box
        component="div"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button
          // component={Link}
          // to={backPath!}
          onClick={() => {
            redirectToTab
              ? navigate(parentPageLink, {
                  state: { redirectToTab: redirectToTab },
                })
              : navigate(parentPageLink);
          }}
          variant="text"
          startIcon={<MdKeyboardArrowLeft />}
          className={classes.backButton}
        >
          Back
        </Button>

        <CustomButtonGroup
          options={options}
          handleSubmit={onSubmit}
          disableBtnFor={disableOption ? disableOption : []}
        />
      </Box>

      <div className={classes.childrenContainer}>{children}</div>
      {visible && (
        <Tooltip title="Scroll To Top">
          <Fab
            size="medium"
            data-testid="fabMobile"
            onClick={scrollToTop}
            className={classes.fabBtn}
          >
            <MdArrowUpward />
          </Fab>
        </Tooltip>
      )}
    </div>
  );
};

export default memo(TemplateFormWrapper);
