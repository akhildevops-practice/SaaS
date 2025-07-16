import axios from "axios";

const setDataFromGoogle = async (file: any, accessToken: any) => {
  try {

    let response;
    let fileData;
    // Check if the file is a Google Docs, Sheets, or Slides file by checking MIME type
    const isGoogleDoc =
      file.mimeType === "application/vnd.google-apps.document";
    const isGoogleSheet =
      file.mimeType === "application/vnd.google-apps.spreadsheet";
    const isGoogleSlide =
      file.mimeType === "application/vnd.google-apps.presentation";

    if (isGoogleDoc || isGoogleSheet || isGoogleSlide) {
      // Export the Google Docs, Sheets, or Slides file to a desired format (e.g., PDF)
      const exportMimeType = "application/pdf"; // You can change this to any export format
      const exportUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${exportMimeType}`;

      // Fetch the file export
      response = await axios.get(exportUrl, {

        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "blob",

      });

      const blob = response.data;

      // Convert the blob to a File object
      const fileObject = new File([blob], file.name, { type: blob.type });

      // Mimic the structure used in onChange
      fileData = {
        uid: file.id,
        name: file.name,
        status: "done",
        url: URL.createObjectURL(blob),
        originFileObj: fileObject,
      };
    } else {
      // For other file types (non-Google files), directly fetch the file data
      response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&supportsAllDrives=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        }
      );

      const blob = response.data;

      // Convert the blob to a File object
      const fileObject = new File([blob], file.name, { type: blob.type });

      // Mimic the structure used in onChange
      fileData = {
        uid: file.id,
        name: file.name,
        status: "done",
        url: URL.createObjectURL(blob),
        originFileObj: fileObject,
      };
    }

    return fileData;
  } catch (error) {

    console.error("Error setting data from Google Drive: ", error);
  }
};

export default setDataFromGoogle;
