import React from "react";
import { createTheme } from "@material-ui/core/styles";
import { responsiveFontSizes } from "@material-ui/core";

declare module "@material-ui/core/styles/createTheme" {
  interface Theme {
    textColor: {
      primary: string;
      white: string;
      black: string;
    };

    backgroundColor: {
      paper: string;
      panels: string;
    };

    notificationBackgroundColor: {
      warning: string;
      primary: string;
      success: string;
    };

    notificationTextColor: {
      warning: string;
      primary: string;
      success: string;
    };

    auditFont: {
      small: React.CSSProperties["fontSize"];
      medium: React.CSSProperties["fontSize"];
      large: React.CSSProperties["fontSize"];
    };
  }

  interface ThemeOptions {
    textColor?: {
      primary?: string;
      white?: string;
      black?: string;
    };
    backgroundColor?: {
      paper?: string;
      panels?: string;
    };
    notificationBackgroundColor?: {
      warning?: string;
      primary?: string;
      success?: string;
    };

    notificationTextColor?: {
      warning?: string;
      primary?: string;
      success?: string;
    };

    auditFont?: {
      small?: React.CSSProperties["fontSize"];
      medium?: React.CSSProperties["fontSize"];
      large?: React.CSSProperties["fontSize"];
    };
  }
}

export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        light: "#6E7DAB",
        main: "#0E0A42",
        dark: "#24273c",
      },
      secondary: {
        light: "#f6f6f6",
        main: "#f4f4f4",
        dark: "#aaaaaa",
      },

      warning: {
        main: "#FFBA08",
      },
      error: {
        main: "#de2635",
      },
      success: {
        main: "#2db556",
      },
    },

    notificationBackgroundColor: {
      warning: "#FFF9ED",
      primary: "#F1EFFD",
      success: "#EEFDFF",
    },

    notificationTextColor: {
      warning: "#F9B63F",
      primary: "#7561E7",
      success: "#2DC0CA",
    },

    textColor: {
      primary: "#14213D",
      white: "#FFFFFF",
      black: "#001219",
    },

    backgroundColor: {
      paper: "#FFFFFF",
      panels: "#EDF6F9",
    },
    overrides: {
      MuiTableCell: {
        root: {
          padding: 0,
          borderBottom: "none",
        },
      },
      MuiIconButton: {
        root: {
          "&:hover": {
            backgroundColor: "$labelcolor",
          },
        },
      },
      MuiTab: {
        root: {
          textTransform: "none",
          fontSize: "0.813rem",
        },
      },
      MuiButton: {
        root: {
          textTransform: "none",
        },
      },
      MuiSwitch: {
        switchBase: {
          color: "#6E7DAB",
          "&$checked": {
            color: "#0E0A42",
          },
          "&$checked + $track": {
            backgroundColor: "#0E0A42",
          },
        },
      },
      MuiInputBase: {
        root: {
          "&$disabled": {
            backgroundColor: "rgba(247, 246, 246, 1)",
          },
        },
      },
      MuiOutlinedInput: {
        multiline: {
          padding: "5px 14px",
        },
      },
    },

    auditFont: {
      small: 10,
      medium: "0.813rem",
      large: 15,
    },
    typography: {
      fontFamily: "IBM Plex Sans, sans-serif",
    },
  })
);
