import { Grid, Fade, Backdrop, Modal, Button } from "@material-ui/core";
import { useStyles } from "./styles";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  heading: string;
  text: string;
  buttons?: {
    name: string;
    color: "inherit" | "default" | "primary" | "secondary" | undefined;
    func: () => void;
  }[];
};

function CustomModal({ open, setOpen, heading, text, buttons }: Props) {
  const classes = useStyles();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal
      className={classes.modal}
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <div className={classes.paper}>
          <h2>{heading}</h2>
          <p>{text}</p>
          <Grid
            container
            style={{
              marginTop: 30,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {buttons?.map((button, i) => (
              <Grid item key={i}>
                <Button
                  variant="contained"
                  disableElevation
                  style={{ borderRadius: 7 }}
                  color={button.color}
                  onClick={() => {
                    button.func();
                    setOpen(false);
                  }}
                >
                  <strong>{button.name}</strong>
                </Button>
              </Grid>
            ))}
          </Grid>
        </div>
      </Fade>
    </Modal>
  );
}

export default CustomModal;
