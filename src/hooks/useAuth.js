import { emailRegex } from "@/static/Constants";
import { updateUserData } from "@redux/slice/userSlice";
import checkInternetConnection from "@utils/CheckInternetConnection";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoginUser, RegisterUser } from "../service/MilanApi";
import { showErrorToast, showSuccessToast } from "../utils/Toasts";

export function useAuth(authType) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  async function authenticateUser(credentials, setErrors) {
    if (!checkInternetConnection()) {
      return;
    }

    if (emailRegex.test(credentials.email) === false) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return;
    }

    // Passwords needs to be minimum 8 characters long with atleast 1 number, 1 uppercase and 1 lowercase letter
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (passwordRegex.test(credentials.password) === false) {
      setErrors((prev) => ({
        ...prev,
        password:
          "Password must be minimum 8 characters long with atleast 1 number, 1 uppercase and 1 lowercase letter",
      }));
      return;
    }

    setLoading(true);

    const response = await (authType === "signin"
      ? LoginUser(credentials)
      : RegisterUser({
          ...credentials,
          userType: credentials.userType.value,
        }));

    if (response?.status === 201 || response?.status === 200) {
      showSuccessToast(response?.data?.message);
      const userData = response.data.user;
      dispatch(
        updateUserData({
          ...userData,
          isLoggedIn: true,
        }),
      );

      if (typeof window.pendo !== "undefined") {
        window.pendo.identify({
          visitor: {
            id: userData._id,
            email: userData.email || credentials.email,
            full_name: userData.name || [userData.firstName, userData.lastName].filter(Boolean).join(" "),
            userName: userData.userName,
            userType: userData.userType,
            firstName: userData.firstName,
            lastName: userData.lastName,
            name: userData.name,
            description: userData.description,
            tagLine: userData.tagLine,
            addressCity: userData.address?.city,
            addressState: userData.address?.state,
            addressCountry: userData.address?.country,
            addressPincode: userData.address?.pincode,
            hasCompletedProfile: userData.config?.hasCompletedProfile,
            isLoggedIn: true,
            profileImage: userData.profileImage,
            coverImage: userData.coverImage,
          },
          account: {
            id: userData.userType === "club" ? userData._id : undefined,
            name: userData.userType === "club" ? userData.name : undefined,
            userName: userData.userName,
            userType: userData.userType,
            tagLine: userData.tagLine,
            description: userData.description,
            hasCompletedProfile: userData.config?.hasCompletedProfile,
            addressCity: userData.address?.city,
            addressState: userData.address?.state,
            addressCountry: userData.address?.country,
            addressPincode: userData.address?.pincode,
          },
        });
      }

      setTimeout(() => {
        navigate("/");
        setLoading(false);
      }, 1000);
    } else {
      showErrorToast(response?.data?.message);
      setLoading(false);
    }
  }

  return {
    authenticateUser,
    loading,
  };
}
