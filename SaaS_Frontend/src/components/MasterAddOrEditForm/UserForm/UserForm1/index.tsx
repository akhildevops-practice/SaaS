import React, { useEffect, useRef } from "react";
import useStyles from "../styles";
import { Box, Button, Grid, TextField } from "@material-ui/core";
import SignaturePad from "signature_pad";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  userType: any;
  handleChange: any;
  formData: any;
  setFormData: any;
  disabledForDeletedModal?: boolean;
};

function UserForm1({
  userType,
  handleChange,
  formData,
  setFormData,
  disabledForDeletedModal,
}: Props) {
  const classes = useStyles();
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  useEffect(() => {
    if (sigCanvas?.current && formData?.signature) {
      sigCanvas.current?.fromDataURL(formData?.signature);
    }
  }, [formData?.signature]);

  const clear = () => sigCanvas.current?.clear();
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string); // This will be like "data:image/png;base64,..."
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  const save = async () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Please provide a signature.");
      return;
    }
    const dataURL: any = sigCanvas?.current?.getCanvas().toDataURL("image/png");
    // console.log("data url", dataURL);
    const blob = await (await fetch(dataURL)).blob();
    const maxSizeInKB = 100; // limit e.g. 100 KB
    const maxSizeInBytes = maxSizeInKB * 1024;

    if (blob.size > maxSizeInBytes) {
      alert(`Signature is too large. Please keep it under ${maxSizeInKB} KB.`);
      return;
    }
    const base64String = await blobToBase64(blob);
    setFormData({
      ...formData,
      signature: base64String,
    });
  };
  // console.log("data in UserFrom1", formData);
  return (
    <Grid container>
      {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>User Type*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <FormControl
          className={classes.formControl}
          variant="outlined"
          size="small"
        >
          <InputLabel>User Type</InputLabel>
          <Select
            label="User Type"
            value={formData.userType}
            onChange={handleChange}
            name="userType"
            data-testid="userType"
            required
          >
            {userType.map((item: any) => {
              return (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid> */}
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>Email Address*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <TextField
          fullWidth
          // label='Login URL'
          name="email"
          value={formData.email}
          inputProps={{
            "data-testid": "login-url",
          }}
          disabled={disabledForDeletedModal}
          variant="outlined"
          onChange={handleChange}
          size="small"
        />
      </Grid>
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>First Name*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <TextField
          fullWidth
          // label='Login URL'
          name="firstName"
          value={formData.firstName}
          inputProps={{
            "data-testid": "login-url",
          }}
          disabled={disabledForDeletedModal}
          variant="outlined"
          onChange={handleChange}
          size="small"
        />
      </Grid>
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>Last Name*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <TextField
          fullWidth
          // label='Login URL'
          name="lastName"
          value={formData.lastName}
          inputProps={{
            "data-testid": "login-url",
          }}
          disabled={disabledForDeletedModal}
          variant="outlined"
          onChange={handleChange}
          size="small"
        />
      </Grid>
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>Username*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <TextField
          fullWidth
          // label='Login URL'
          name="username"
          value={formData.username}
          inputProps={{
            "data-testid": "login-url",
            maxLength: 100,
          }}
          disabled={disabledForDeletedModal}
          variant="outlined"
          onChange={handleChange}
          size="small"
        />
      </Grid>
      {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>User Signature</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <Box className={classes.sigBox}>
          <SignatureCanvas
            penColor="black"
            canvasProps={{ className: classes.sigCanvas }}
            ref={sigCanvas}
          />
        </Box>

        <Box className={classes.buttonGroup}>
          <Button variant="outlined" onClick={clear}>
            Clear
          </Button>
          <Button variant="contained" color="primary" onClick={save}>
            Save
          </Button>
        </Box>
      </Grid> */}
    </Grid>
  );
}

export default UserForm1;
