import { IconButton, Grid, Box, Modal, Typography } from "@material-ui/core";
import { MdClose } from 'react-icons/md';
import { useStyles } from "./styles";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  maxWidth: number;
  title: React.ReactNode;
  children: any;
};

function ModalWrapper({ open, setOpen, maxWidth, title, children }: Props) {
  const classes = useStyles();

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box className={classes.box} maxWidth={maxWidth}>
        <Grid container className={classes.header}>
          <Grid item xs={11}>
            <Typography variant="h3" className={classes.title}>
              {title}
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <IconButton
              onClick={() => setOpen(false)}
              style={{ position: "absolute", top: -7, right: 0 }}
            >
              <MdClose />
            </IconButton>
          </Grid>
        </Grid>

        <Box p={2} pt={0}>
          {children}
        </Box>
      </Box>
    </Modal>
  );
}

export default ModalWrapper;
