import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "./store";
import { getCurrentUser } from "./features/auth/store/authSlice";
import AppRouter from "./routes";
import { setLoading } from "./store/uiSlice";
import { ToastNotifications } from "./components/ui/toast-notifications";
import { Toaster } from "./components/ui/sonner";

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
  const isLoading = useAppSelector(
    (state) => state.ui.loading["authCheck"] || false
  );
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading({ key: "authCheck", isLoading: true }));
      try {
        await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setAuthChecked(true);
        dispatch(setLoading({ key: "authCheck", isLoading: false }));
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isLoading || !authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Main app component
const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer>
          <AppRouter />
          <ToastNotifications />
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={false}
            theme={
              document.documentElement.classList.contains("dark")
                ? "dark"
                : "light"
            }
            toastOptions={{
              classNames: {
                toast: "sonner-toast",
                title: "sonner-title",
                description: "sonner-description",
                actionButton: "sonner-action",
                cancelButton: "sonner-cancel",
                closeButton: "sonner-close",
              },
            }}
          />
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
