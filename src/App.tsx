import { useEffect } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "./store";
import AppRouter from "./routes";
import { fetchCurrentUser } from "./features/auth/store/authSlice";

// ThemeProvider to manage dark/light mode
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Check for user's theme preference
  useEffect(() => {
    // Check if dark mode is stored in localStorage
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    // Check for system preference if no localStorage value
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Apply theme
    if (isDarkMode || (isDarkMode === null && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return <>{children}</>;
};

// Auth initializer component to fetch user data on app start
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Try to fetch current user data - this will verify if the user is authenticated
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return <>{children}</>;
};

// Main app component
const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer>
          <AppRouter />
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
