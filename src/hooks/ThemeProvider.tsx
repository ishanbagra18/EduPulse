import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    darkTheme,
    lightTheme,
    THEME_KEY,
    ThemeName,
} from "../constants/theme";

type ThemeContextType = {
  theme: typeof lightTheme;
  themeName: ThemeName;
  toggleTheme: () => Promise<void>;
  setThemeName: (name: ThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeName, setThemeNameState] = useState<ThemeName>("light");
  const theme = themeName === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(THEME_KEY);
        if (raw === "dark" || raw === "light") setThemeNameState(raw);
      } catch (err) {}
    })();
  }, []);

  const setThemeName = async (name: ThemeName) => {
    setThemeNameState(name);
    try {
      await AsyncStorage.setItem(THEME_KEY, name);
    } catch (err) {}
  };

  const toggleTheme = async () => {
    await setThemeName(themeName === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{ theme, themeName, toggleTheme, setThemeName }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
};

export default ThemeProvider;
