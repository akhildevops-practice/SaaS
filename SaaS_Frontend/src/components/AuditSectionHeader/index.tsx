import TextFieldComponent from "../TextfieldComponent";
import Box from "@material-ui/core/Box";
import bin from "../../assets/icons/bin.svg";
import add from "../../assets/icons/add.svg";
import IconButton from "@material-ui/core/IconButton";
import { memo, useState } from "react";
import { Dialog, Tooltip, Button } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

type Props = {
  index: number;
  title: string;
  addSection: () => void;
  removeSection: (index: any) => void;
  onChange: (e: any) => void;
};

/**
 * @component AuditSectionHeader
 * @description Audit section header component which generates the header for the section
 * @param title {string}
 * @param addSection {() => void}
 * @param removeSection {(index: any) => void}
 * @param onChange {(e: any) => void}
 * @returns a react component
 */
const AuditSectionHeader = ({
  index,
  title,
  addSection,
  removeSection,
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  /**
   * @method handleClickOpen
   * @description Function to open the dialog box
   * @returns nothing
   */
  const handleClickOpen = () => {
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

  return (
    <Box
      display="flex"
      gridGap={10}
      mt={2}
      flexDirection={{ xs: "column", sm: "row", md: "row" }}
    >
      <Box
        bgcolor="white"
        flexGrow={1}
        p={"clamp(1rem, 70px, 2rem)"}
        borderTop={10}
        borderRadius={10}
        borderColor="primary.light"
      >
        <TextFieldComponent
          label="Section Title"
          type="text"
          name="title"
          value={title}
          onChange={onChange}
          autoFocus={true}
        />
      </Box>

      <Box
        bgcolor="white"
        borderRadius={10}
        display="flex"
        flexDirection={{ xs: "row", sm: "column", md: "column" }}
        padding={1}
        justifyContent="space-around"
      >
        <Tooltip title="Add Section">
          <IconButton onClick={addSection}>
            <img src={add} alt="add icon" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Section">
          <IconButton data-testid="delete-section-button" onClick={handleClickOpen}>
            <img src={bin} alt="bin icon" />
          </IconButton>
        </Tooltip>
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogContent>
            <DialogContentText>
              Do you want to delete this section?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleClose} color="primary">
              No
            </Button>
            <Button
              onClick={() => {
                removeSection(index);
                handleClose();
              }}
              data-testid="remove-button"
              color="primary"
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default memo(AuditSectionHeader);
