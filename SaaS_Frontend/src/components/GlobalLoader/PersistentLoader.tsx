import React, { useEffect, useState } from "react";
import { Box, LinearProgress, Typography, IconButton } from "@material-ui/core";
import { MdClose } from 'react-icons/md';
import { registerLoaderVisibilityHandler } from "./loaderState";

const PersistentLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showCompletionMessage, setShowCompletionMessage] =
    useState<boolean>(false);
  const [message, setMessage] = useState<string>("Processing Images...");

  useEffect(() => {
    // Register the visibility handler when the component mounts
    registerLoaderVisibilityHandler(handleVisibilityChange);
  }, []);

  const handleVisibilityChange = (visible: boolean, customMessage?: string) => {
    if (!visible) {
      setShowCompletionMessage(true);
      setTimeout(() => {
        setIsVisible(false);
        setShowCompletionMessage(false);
      }, 2000);
    } else {
      setMessage(customMessage || "Processing Images...");
      setIsVisible(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setShowCompletionMessage(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        width: "20%", // 20% width
        backgroundColor: "rgba(249, 246, 238,0.9)", // Background color as specified
        padding: "12px", // Add some padding for better spacing
        borderRadius: "12px", // Rounded borders
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", // Light shadow for better visibility
        zIndex: 1300, // Ensures the loader stays on top
      }}
    >
      <IconButton
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: 0,
        }}
        onClick={handleClose}
      >
        <MdClose />
      </IconButton>

      {showCompletionMessage ? (
        <Typography
          variant="body1"
          style={{ color: "#333", textAlign: "center" }}
        >
           {message}
        </Typography>
      ) : (
        <Box
          style={{
            width: "100%",
            margin: "20px 0",
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            style={{ marginBottom: 8, color: "#333" }}
          >
            {message}
          </Typography>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default PersistentLoader;
