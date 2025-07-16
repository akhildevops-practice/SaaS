import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@material-ui/core";
import axios from "apis/axios.global";
import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
type Props = {
  userData: any;
  action: any;
  onClose: any;
  open: any;
  handleMarkDone: any;
  index?: any;
  comment: any;
  setComment: any;
};
const SignatureComponent = ({
  userData,
  action,
  open,
  onClose,
  handleMarkDone,
  index,
  comment,
  setComment,
}: Props) => {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [cleared, setCleared] = useState(false);

  // Load existing signature when modal opens
  useEffect(() => {
    if (open && userData?.signature) {
      const timer = setTimeout(() => {
        if (sigCanvas.current) {
          const formattedSignature = userData.signature.startsWith("data:image")
            ? userData.signature
            : `data:image/png;base64,${userData.signature}`;
          sigCanvas.current.fromDataURL(formattedSignature);
        }
      }, 100); // small delay to wait for canvas to mount

      return () => clearTimeout(timer);
    }
  }, [open, userData?.signature]);

  const clear = () => {
    sigCanvas.current?.clear();
    setCleared(true); // mark that it's been cleared
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const save = async () => {
    if (!sigCanvas.current) return;

    if (sigCanvas.current.isEmpty()) {
      alert("Please provide a signature.");
      return;
    }

    const dataURL = sigCanvas.current.getCanvas().toDataURL("image/png");
    const blob = await (await fetch(dataURL)).blob();
    const maxSizeKB = 100;

    if (blob.size > maxSizeKB * 1024) {
      alert(`Signature is too large. Keep it under ${maxSizeKB}KB.`);
      return;
    }

    const base64 = await blobToBase64(blob);
    const updateUser = await axios.put(`/api/user/patchUser/${userData?.id}`, {
      signature: base64,
    });
    if (updateUser.status === 200) {
      if (index || index === 0) {
        handleMarkDone(index);
      } else {
        handleMarkDone();
      }
    }

    onClose();
  };
  // console.log("userdata", sigCanvas?.current);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Digital Signature</DialogTitle>
      <DialogContent>
        <Typography variant="body1" style={{ marginBottom: 10 }}>
          Please proceed to sign this document
        </Typography>
        <SignatureCanvas
          penColor="black"
          canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
          ref={sigCanvas}
        />
        {/* <Typography variant="body1" style={{ marginBottom: 10 }}>
          Comments(Optional)
        </Typography> */}
        <TextField
          label="Comments"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ marginTop: 20 }}
        />
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={clear} color="primary" variant="contained">
          Clear
        </Button>
        <Button onClick={save} color="primary" variant="contained">
          Sign and Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureComponent;
