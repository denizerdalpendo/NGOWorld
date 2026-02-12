import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, useRef } from "react";
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
  const pendoInitialized = useRef(false);

  useEffect(() => {
    if (typeof window.pendo !== "undefined" && !pendoInitialized.current) {
      window.pendo.initialize({
        visitor: {
          id: "ANONYMOUS_VISITOR_ID",
        },
      });
      pendoInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (
      typeof window.pendo !== "undefined" &&
      user?.isLoggedIn &&
      user?._id
    ) {
      window.pendo.identify({
        visitor: {
          id: user._id,
          email: user.email,
          full_name: user.name || [user.firstName, user.lastName].filter(Boolean).join(" "),
          userName: user.userName,
          userType: user.userType,
          firstName: user.firstName,
          lastName: user.lastName,
          description: user.description,
          addressCity: user.address?.city,
          addressState: user.address?.state,
          addressCountry: user.address?.country,
          addressPincode: user.address?.pincode,
          hasCompletedProfile: user.config?.hasCompletedProfile,
          isLoggedIn: user.isLoggedIn,
          profilePicture: user.profileImage,
        },
        account: {
          id: user.userType === "club" ? user._id : undefined,
          name: user.userType === "club" ? user.name : undefined,
          userName: user.userName,
          tagLine: user.tagLine,
          description: user.description,
          hasCompletedProfile: user.config?.hasCompletedProfile,
          addressCity: user.address?.city,
          addressState: user.address?.state,
          addressCountry: user.address?.country,
          addressPincode: user.address?.pincode,
          website: user.website,
        },
      });
    }
  }, [user]);

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
