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
      if (typeof pendo !== "undefined") {
        pendo.track("signup_form_validation_error", {
          error_field: "email",
          error_message: "Please enter a valid email address",
          auth_type: authType,
        });
      }
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
      if (typeof pendo !== "undefined") {
        pendo.track("signup_form_validation_error", {
          error_field: "password",
          error_message: "Password must be minimum 8 characters long with atleast 1 number, 1 uppercase and 1 lowercase letter",
          auth_type: authType,
        });
      }
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

      if (typeof pendo !== "undefined") {
        if (authType === "signup") {
          pendo.track("user_signed_up", {
            user_type: response.data.user?.userType || credentials.userType?.value,
            registration_method: "email",
            email_domain: credentials.email?.split("@")[1] || "",
          });
        } else {
          pendo.track("user_signed_in", {
            user_type: response.data.user?.userType || "",
            login_method: "email",
          });
        }
      }

      setTimeout(() => {
        navigate("/");
        setLoading(false);
      }, 1000);
    } else {
      if (typeof pendo !== "undefined") {
        pendo.track("auth_failed", {
          auth_type: authType,
          error_message: response?.data?.message || "Unknown error",
          status_code: String(response?.status || ""),
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
