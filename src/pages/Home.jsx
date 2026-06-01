import Cookies from "js-cookie";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch } from "react-redux";
import { Landing } from "../components/private/index.js";
import { Footer } from "../components/shared";
import { toggleUserLogin, updateUserData } from "../redux/slice/userSlice.js";
import { successCallback } from "../service/MilanApi.js";
import { showErrorToast, showSuccessToast } from "../utils/Toasts.js";

const Home = () => {
  const dispatch = useDispatch();
  const handleToken = async () => {
    const authData = await successCallback();

    if (authData?.status === 200) {
      showSuccessToast(authData?.data?.message);
      const userData = authData.data.user;
      dispatch(updateUserData(userData));
      dispatch(toggleUserLogin());

      pendo.identify({
        visitor: {
          id: userData._id,
          email: userData.email,
          full_name: userData.name,
          userName: userData.userName,
          userType: userData.userType,
          firstName: userData.firstName,
          lastName: userData.lastName,
          description: userData.description,
          tagLine: userData.tagLine,
          city: userData.city,
          state: userData.state,
          country: userData.country,
          pincode: userData.pincode,
          hasCompletedProfile: userData.config?.hasCompletedProfile,
        },
      });
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
