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
      dispatch(
        updateUserData({
          ...response.data.user,
          isLoggedIn: true,
        }),
      );

      // Pendo Track: user_signed_up
      if (authType === "signup") {
        pendo.track("user_signed_up", {
          user_type: credentials.userType?.value || "individual",
          auth_method: "email",
          email_domain: credentials.email?.split("@")[1] || "",
        });
      }

      // Pendo Track: user_signed_in
      if (authType === "signin") {
        pendo.track("user_signed_in", {
          auth_method: "email",
          user_type: response.data.user?.userType || "",
        });
      }

      setTimeout(() => {
        navigate("/");
        setLoading(false);
      }, 1000);
    } else {
      // Pendo Track: user_signup_failed
      if (authType === "signup") {
        pendo.track("user_signup_failed", {
          error_type: "server",
          error_message: (response?.data?.message || "Unknown error").substring(0, 100),
          user_type: credentials.userType?.value || "individual",
          auth_method: "email",
        });
      }

      // Pendo Track: user_signin_failed
      if (authType === "signin") {
        pendo.track("user_signin_failed", {
          error_type: "server",
          error_message: (response?.data?.message || "Unknown error").substring(0, 100),
        });
      }

      showErrorToast(response?.data?.message);
      setLoading(false);
    }
  }

  return {
    authenticateUser,
    loading,
  };
}
