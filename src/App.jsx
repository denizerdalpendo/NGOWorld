import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { BacktoTop } from "./components/shared";
import { selectUser } from "./redux/slice/userSlice";
import "./styles/App.css";
import "./styles/Globals.scss";
import routesConfig from "./utils/routesConfig.jsx";

const App = () => {
  const queryClient = new QueryClient();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user?.isLoggedIn && user?._id) {
      // User is logged in (either fresh login or restored from persisted state)
      window.pendo.initialize({
        visitor: {
          id: user._id,
          email: user.email,
          full_name: user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user.name || user.userName,
          userName: user.userName,
          userType: user.userType,
          firstName: user.firstName,
          lastName: user.lastName,
          isLoggedIn: user.isLoggedIn,
          hasCompletedProfile: user.config?.hasCompletedProfile,
          description: user.description,
          tagLine: user.tagLine,
          city: user.city,
          state: user.state,
          country: user.country,
          pincode: user.pincode,
          address: user.address,
          website: user.website,
        },
      });
    } else {
      // Anonymous visitor
      window.pendo.initialize({
        visitor: {
          id: "VISITOR-UNIQUE-ID",
        },
      });
    }
  }, [user?.isLoggedIn, user?._id]);

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="app">
          <ToastContainer />
          <Suspense fallback={"Loading . . ."}>
            <Router>
              <Routes>
                {routesConfig.map((route, index) => (
                  <Route
                    key={index}
                    exact
                    path={route?.path}
                    element={route?.element}
                  />
                ))}
              </Routes>
            </Router>
          </Suspense>
          <BacktoTop />
        </div>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

export default App;
