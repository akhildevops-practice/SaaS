// Define the type for the handler function, including the message parameter
type LoaderVisibilityHandler = (isVisible: boolean, message?: string) => void;

// This variable will hold the reference to the visibility handler function
let setLoaderVisible: LoaderVisibilityHandler | undefined;

// Register the handler function, which will be called to update the loader's visibility and message
export const registerLoaderVisibilityHandler = (handler: LoaderVisibilityHandler): void => {
  setLoaderVisible = handler;
};

// Show the loader by setting the visibility to true and optionally passing a message
export const showLoader = (message?: string): void => {
  if (setLoaderVisible) {
    setLoaderVisible(true, message);
  }
};

// Hide the loader by setting the visibility to false
export const hideLoader = (): void => {
  if (setLoaderVisible) {
    setLoaderVisible(false);
  }
};
