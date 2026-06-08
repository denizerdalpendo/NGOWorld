import { useDispatch } from "react-redux";
import { useSWRConfig } from "swr";
import { eventEndpoints } from "../integrations/ApiEndpoints";
import { CreateEvent } from "../service/MilanApi";
import { showErrorToast, showSuccessToast } from "../utils/Toasts";

export function useEvent(event) {
  const { uid, ...data } = event;
  const errors = {};
  const dispatch = useDispatch();
  const { mutate } = useSWRConfig();

  const validateEvent = () => {
    if (
      !data.name ||
      !uid ||
      !data.description ||
      !data.coverImage ||
      !data.mode ||
      !data.startDate ||
      !data.endDate ||
      !data.startTime ||
      !data.endTime
    ) {
      if (!data.name) errors.name = "Name is required";
      if (!uid) errors.uid = "UID is required";
      if (!data.description) errors.description = "Description is required";
      if (!data.coverImage) errors.coverImage = "Cover image is required";
      if (!data.mode) errors.mode = "Mode is required";
      if (!data.startDate) errors.startDate = "Start date is required";
      if (!data.endDate) errors.endDate = "End date is required";
      if (!data.startTime) errors.startTime = "Start time is required";
      if (!data.endTime) errors.endTime = "End time is required";

      if (data?.mode === "Offline") {
        if (!data.city) errors.city = "City is required";
        if (!data.state) errors.state = "State is required";
        if (!data.country) errors.country = "Country is required";
        if (!data.address) errors.address = "Address is required";
        if (!data.mapIframe) errors.mapIframe = "Map iframe is required";
      } else {
        if (!data.platformLink)
          errors.platformLink = "Please provide a platform link";
      }
    }

    if (data.name.length < 10 || data.name.length > 80)
      errors.name = "Name should be between 10 and 80 characters";

    if (data.description.length < 20 || data.description.length > 200)
      errors.description =
        "Description should be between 20 and 200 characters";

    if (data.endDate < data.startDate)
      errors.endDate = "End date should be greater than start date";

    if (data.endTime < data.startTime)
      errors.endTime = "End time should be greater than start time";

    return errors;
  };

  const submitCallback = async (event, setshowCreateModal) => {
    if (Object.keys(errors).length === 0) {
      const response = await CreateEvent(event);

      if (response.status === 201) {
        // Track successful event creation
        if (typeof pendo !== "undefined") {
          pendo.track("event_created", {
            eventName: event.name || "",
            eventMode: event.mode || "",
            startDate: event.startDate
              ? String(event.startDate)
              : "",
            endDate: event.endDate ? String(event.endDate) : "",
            city: event.city || "",
            state: event.state || "",
            country: event.country || "",
            platform: event.platform || "",
            hasCoverImage: Boolean(
              event.coverImage &&
                event.coverImage !==
                  "https://images.pexels.com/videos/3045163/free-video-3045163.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500",
            ),
            descriptionLength: event.description
              ? event.description.length
              : 0,
          });
        }

        showSuccessToast(response.data.message);
        setshowCreateModal(false);

        if (typeof pendo !== "undefined") {
          pendo.track("event_created", {
            eventName: event.name,
            eventMode: event.mode,
            eventUid: event.uid,
            country: event.country,
            platform: event.platform,
            startDate: event.startDate,
            endDate: event.endDate,
          });
        }

        mutate(eventEndpoints.all);
      } else {
        if (typeof pendo !== "undefined") {
          pendo.track("event_creation_failed", {
            errorType: "api_error",
            errorMessage: response.response?.data?.message,
            eventMode: event.mode,
          });
        }
        showErrorToast(response.response.data.message);
      }
    } else {
      if (typeof pendo !== "undefined") {
        pendo.track("event_creation_failed", {
          errorType: "validation_error",
          validationErrors: Object.keys(errors).join(","),
          eventMode: event.mode,
        });
      }
      showErrorToast("Please fill all the required fields");
    }
  };

  return {
    validateEvent,
    submitCallback,
  };
}
