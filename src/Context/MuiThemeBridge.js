import React, { useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { useTheme } from "./ThemeContext";

/**
 * Every MUI component (TextField, Button, CircularProgress, etc.) uses MUI's
 * own theming system -- it has no idea our app has a light/dark toggle,
 * since that's plain Tailwind `dark:` classes on a <html> element. Without
 * this bridge, MUI always renders its light-mode defaults (dark text,
 * light borders), which is invisible against our dark-mode backgrounds.
 * This reads our app's theme and feeds MUI a matching palette so every MUI
 * component adapts automatically, instead of hand-patching each one.
 */
export default function MuiThemeBridge({ children }) {
  const { theme } = useTheme();

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: { main: "#1a365d" },
        },
      }),
    [theme],
  );

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
}
