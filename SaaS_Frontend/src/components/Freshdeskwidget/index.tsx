import React, { useEffect } from "react";

interface User {
  username: string;
  email: string;
  Location: string;
  Entity: string;
}

interface FreshdeskWidgetProps {
  user?: User;
}

const FreshdeskWidget: React.FC<FreshdeskWidgetProps> = ({ user }) => {
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  useEffect(() => {
    // Load the Freshworks widget script only once on mount
    window.fwSettings = {
      widget_id: 1060000001846,
      user: {
        name: userDetail?.fullName,
        email: userDetail?.email,
      },
      customFields: {
        cf_location: userDetail.location?.locationName,
        cf_entity: userDetail.entity?.entityName,
      },
    };

    const script = document.createElement("script");
    script.src = "https://ind-widget.freshworks.com/widgets/1060000001846.js";
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);

    script.onload = () => {
      //   if (window.FreshworksWidget) {
      // Set the widget configuration
      if (window?.fwSettings) {
        window.fwSettings = {
          widget_id: 1060000001846,
          user: {
            name: userDetail?.fullName || "",
            email: userDetail?.email || "",
          },
          customFields: {
            cf_location: userDetail.location?.locationName,
            cf_entity: userDetail.entity?.entityName,
          },
        };

        setTimeout(() => {
          window.fwSettings = {
            widget_id: 1060000001846,
            user: {
              name: userDetail?.fullName,
              email: userDetail?.email,
            },
            customFields: {
              cf_location: userDetail.location?.locationName,
              cf_entity: userDetail.entity?.entityName,
            },
          };

          window?.FreshworksWidget("prefill", "ticketForm", {
            name: userDetail?.fullName || "",
            email: userDetail?.email || "",

            customFields: {
              cf_location: userDetail.location?.locationName,
              cf_entity: userDetail.entity?.entityName,
            },
          });
        }, 1500);
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default FreshdeskWidget;
