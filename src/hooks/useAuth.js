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
      if (authType === "signin") {
        if (typeof pendo !== "undefined") {
          pendo.track("user_signed_in", {
            authMethod: "email",
          });
        }
      } else if (response?.status === 201) {
        if (typeof pendo !== "undefined") {
          pendo.track("user_registered", {
            userType: credentials.userType?.value || "unknown",
            authMethod: "email",
          });
        }
      }

      showSuccessToast(response?.data?.message);
      const user = response.data.user;
      dispatch(
        updateUserData({
          ...user,
          isLoggedIn: true,
        }),
      );

      pendo.identify({
        visitor: {
          id: user._id,
          email: user.email,
          full_name: user.firstName && user.lastName
            ? user.firstName + ' ' + user.lastName
            : user.name || '',
          user_name: user.userName,
          user_type: user.userType,
        },
      });

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
