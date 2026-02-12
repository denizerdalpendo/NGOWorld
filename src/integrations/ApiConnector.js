import axios from "axios";
export const axiosInstance = axios.create({});

export const apiConnector = async (method, url, bodyData, headers, params) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data: bodyData ? bodyData : null,
      headers: headers ? headers : null,
      params: params ? params : null,
      crossOrigin: true,
      allowCredentials: true,
    });

    if (response.status === 400) {
      console.error("Logout triggered due to status 600 response");
    }

    return response;
  } catch (error) {
    // Pendo Track Event: api_request_error
    if (typeof pendo !== "undefined") {
      pendo.track("api_request_error", {
        api_url: url || "",
        http_method: method || "",
        error_status: String(error?.response?.status || ""),
        error_message: (error?.message || "Unknown error").substring(0, 100),
      });
    }

    console.error("API request error:", error);
    throw error;
  }
};
