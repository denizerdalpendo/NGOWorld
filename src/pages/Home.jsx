/* global pendo */
import Cookies from "js-cookie";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch } from "react-redux";
import { Landing } from "../components/private/index.js";
import { Footer } from "../components/shared";
import { toggleUserLogin, updateUserData } from "../redux/slice/userSlice.js";
import { successCallback } from "../service/MilanApi.js";
import { showErrorToast, showSuccessToast } from "../utils/Toasts.js";

// Module-level guard: handleToken re-runs on every Home mount while the OAuth
// cookie is present, so only report each Google sign-in once per session.
const trackedGoogleSignIns = new Set();

const Home = () => {
  const dispatch = useDispatch();
  const handleToken = async () => {
    const authData = await successCallback();

    if (authData?.status === 200) {
      showSuccessToast(authData?.data?.message);
      const user = authData.data.user;
      dispatch(updateUserData(user));
      dispatch(toggleUserLogin());

      pendo.identify({
        visitor: {
          id: user._id,
          email: user.email,
          full_name:
            user.firstName && user.lastName
              ? user.firstName + " " + user.lastName
              : user.name || "",
          user_name: user.userName,
          user_type: user.userType,
        },
      });

      // Track Event: Google OAuth sign-in confirmed by the backend.
      if (!trackedGoogleSignIns.has(user?._id)) {
        trackedGoogleSignIns.add(user?._id);
        pendo.track("user_signed_in", {
          auth_method: "google",
          user_type: user?.userType,
        });
      }
    } else {
      showErrorToast(authData?.message);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (Cookies.get("OAuthLoginInitiated")) {
      handleToken();
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>NgoWorld</title>
        <meta
          name="description"
          content="Welcome to the homepage of NgoWorld, a hub for Users to collaborate with NGOs, Charities and more."
        />
        <link rel="canonical" href="/" />
      </Helmet>

      <Landing />

      <Footer />
    </>
  );
};

export default Home;
