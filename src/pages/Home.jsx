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
      const user = authData.data.user;
      dispatch(updateUserData(user));
      dispatch(toggleUserLogin());

      window.pendo.identify({
        visitor: {
          id: user._id || '',
          email: user.email || '',
          full_name: user.name || '',
          userName: user.userName || '',
          userType: user.userType || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          description: user.description || '',
          tagLine: user.tagLine || '',
          hasCompletedProfile: user.config?.hasCompletedProfile || false,
          addressCity: user.address?.city || '',
          addressState: user.address?.state || '',
          addressCountry: user.address?.country || '',
          addressPincode: user.address?.pincode || '',
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
