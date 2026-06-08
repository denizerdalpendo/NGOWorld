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
      if (authType === "signup" && typeof pendo !== "undefined") {
        pendo.track("signup_validation_failed", {
          failedField: "email",
          errorMessage: "Please enter a valid email address",
          userType: credentials.userType?.value || "unknown",
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
      if (authType === "signup" && typeof pendo !== "undefined") {
        pendo.track("signup_validation_failed", {
          failedField: "password",
          errorMessage: "Password must be minimum 8 characters long",
          userType: credentials.userType?.value || "unknown",
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
      if (authType === "signin") {
        // Track successful sign-in
        if (typeof pendo !== "undefined") {
          pendo.track("user_signed_in", {
            authMethod: "email",
            responseStatus: response?.status,
          });
        }
      } else {
        // Track successful registration
        if (typeof pendo !== "undefined") {
          pendo.track("user_registered", {
            userType: credentials.userType?.value || "unknown",
            authMethod: "email",
            userName: response?.data?.user?.name || "",
            responseStatus: response?.status,
          });
        }
      }

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
            userType: credentials.userType?.value || "unknown",
            authMethod: "email",
            responseStatus: response?.status,
          });
        } else {
          pendo.track("user_signed_in", {
            authMethod: "email",
            responseStatus: response?.status,
          });
        }
      }

      setTimeout(() => {
        navigate("/");
        setLoading(false);
      }, 1000);
    } else {
      // Track authentication failure
      if (typeof pendo !== "undefined") {
        pendo.track("auth_failed", {
          authType: authType,
          errorMessage: String(
            response?.data?.message || "unknown",
          ).substring(0, 100),
          responseStatus: response?.status || 0,
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
