export const isValid = (
  value: string | undefined | null
): { isValid: boolean; errorMessage?: string } => {
  // Check for empty or invalid input
  if (!value || typeof value !== "string") {
    return {
      isValid: false,
      errorMessage: "Input is required and must be a string.",
    };
  }

  const sanitizedValue = value.trim();

  // Check if the trimmed value is empty
  if (sanitizedValue.length === 0) {
    return {
      isValid: false,
      errorMessage: "Input cannot be empty after trimming.",
    };
  }

  // Define regex pattern for allowed characters (letters, numbers, spaces, and specific symbols)
  const TITLE_REGEX =
    /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,;:\?&%!#@€£$`'"\~]+$/; // Allows Unicode characters including letters, numbers, and allowed symbols

  // Check for disallowed combinations like </, <! and />
  const DISALLOWED_COMBINATIONS = /<\/|<\!|\/>/;

  // Check if the value starts with a special character
  const STARTS_WITH_SPECIAL_CHAR =
    /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s]/;

  // Check if there are more than 3 consecutive special characters
  const MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS =
    /([\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s])\1{3,}/;

  // Check if there are any disallowed combinations (</, <! and />)
  if (DISALLOWED_COMBINATIONS.test(sanitizedValue)) {
    return {
      isValid: false,
      errorMessage:
        "Invalid combination: '</', '<!', and '/>' are not allowed.",
    };
  }

  // Check if the first character is a special character
  // if (STARTS_WITH_SPECIAL_CHAR.test(sanitizedValue)) {
  //   return {
  //     isValid: false,
  //     errorMessage: "Input cannot start with a special character.",
  //   };
  // }

  // Check if the value contains more than 3 consecutive special characters
  if (MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS.test(sanitizedValue)) {
    return {
      isValid: false,
      errorMessage:
        "No special character should appear more than three times consecutively.",
    };
  }

  // Check if the value matches the allowed pattern
  if (!TITLE_REGEX.test(sanitizedValue)) {
    return {
      isValid: false,
      errorMessage: "Input contains invalid characters.",
    };
  }

  // If all checks pass
  return { isValid: true };
};

export const isValidForHiraPage = (
  value: string | undefined | null
): { isValid: boolean; errorMessage?: string } => {
  // Check for empty or invalid input
  if (!value || typeof value !== "string") {
    return {
      isValid: false,
      errorMessage: "Input is required and must be a string.",
    };
  }

  const sanitizedValue = value.trim();

  // Check if the trimmed value is empty
  if (sanitizedValue.length === 0) {
    return {
      isValid: false,
      errorMessage: "Input cannot be empty after trimming.",
    };
  }

  // Define regex pattern for allowed characters (letters, numbers, spaces, and specific symbols)
  const TITLE_REGEX =
    /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,;:\?&%!#@€£$`'"\~]+$/; // Allows Unicode characters including letters, numbers, and allowed symbols

  // Check for disallowed combinations like </, <! and />
  const DISALLOWED_COMBINATIONS = /<\/|<\!|\/>/;

  // Check if the value starts with a special character
  const STARTS_WITH_SPECIAL_CHAR =
    /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s]/;

  // Check if there are any disallowed combinations (</, <! and />)
  if (DISALLOWED_COMBINATIONS.test(sanitizedValue)) {
    return {
      isValid: false,
      errorMessage:
        "Invalid combination: '</', '<!', and '/>' are not allowed.",
    };
  }

  // Check if the value matches the allowed pattern
  if (!TITLE_REGEX.test(sanitizedValue)) {
    return {
      isValid: false,
      errorMessage: "Input contains invalid characters.",
    };
  }

  // If all checks pass
  return { isValid: true };
};
export const isValidMasterName = (
  value: string | undefined | null
): { isValid: boolean; errorMessage?: string } => {
  // Check for empty or invalid input
  if (!value || typeof value !== "string") {
    return {
      isValid: false,
      errorMessage: "Input is required and must be a string.",
    };
  }

  const trimmedValue = value.trim();

  // Check if the trimmed value is empty
  if (trimmedValue === "") {
    return {
      isValid: false,
      errorMessage: "Input cannot be empty after trimming.",
    };
  }
  if (typeof trimmedValue !== "string") {
    return {
      errorMessage: "Text value is required and must be a string.",
      isValid: false,
    };
  }
  // Define regex pattern for allowed characters (letters, numbers, spaces, and specific symbols)
  const TITLE_REGEX = /^[a-zA-Z0-9@._-\s&]+$/;

  // Check for disallowed combinations like </, <! and />
  const DISALLOWED_COMBINATIONS = /<\/|<\!|\/>/;

  // Check if the value starts with a special character
  if (DISALLOWED_COMBINATIONS.test(trimmedValue)) {
    return {
      errorMessage: "Invalid text.",
      isValid: false,
    };
  }

  // Check if there are more than 3 consecutive special characters
  const MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS =
    /([\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s])\1{2,}/;
  if (MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS.test(trimmedValue)) {
    return {
      errorMessage:
        "Invalid text. No special characters are allowed for three times consecutively",
      isValid: false,
    };
  }

  // Check if the value matches the allowed pattern (letters, numbers, hyphens, spaces, and specific symbols)
  if (!TITLE_REGEX.test(trimmedValue)) {
    return {
      errorMessage: "Invalid text",
      isValid: false,
    };
  }

  // Check if the string ends with any disallowed file extension (.exe, .sh, .html)
  const DISALLOWED_EXTENSIONS = /\.(exe|sh|html|msi|bash)$/i;

  if (DISALLOWED_EXTENSIONS.test(trimmedValue)) {
    return { errorMessage: "File extensions are not allowed.", isValid: false };
  }

  // If all checks pass
  return { isValid: true };
};

export const validateTitle = (
  rule: any,
  value: string,
  callback: (error?: string) => void
) => {
  if (!value || typeof value !== "string") {
    callback("Text value is required and must be a string.");
    return;
  }

  // Define regex pattern for allowed characters (letters, numbers, spaces, and specific symbols)
  const TITLE_REGEX =
    /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,;:\?&%!#@€£$`'"\~]+$/; // Allow Unicode letters, numbers, spaces, and specific symbols

  // Check for disallowed combinations like </, <! and />
  const DISALLOWED_COMBINATIONS = /<\/|<\!|\/>/;

  // Check if the value is empty or contains only spaces
  if (!value || value.trim().length === 0) {
    callback("Text value is required.");
    return;
  }

  // Check for disallowed combinations (</, <! and />)
  if (DISALLOWED_COMBINATIONS.test(value)) {
    callback("Invalid combination: '</', '<!', and '/>' are not allowed.");
    return;
  }

  // Check if the first character is a special character
  const STARTS_WITH_SPECIAL_CHAR =
    /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s]/;
  // if (STARTS_WITH_SPECIAL_CHAR.test(value)) {
  //   callback("Text should not start with a special character.");
  //   return;
  // }

  // Check if there are more than 3 consecutive special characters
  const MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS =
    /([\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s])\1{3,}/;
  if (MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS.test(value)) {
    callback(
      "No special character should appear more than three times consecutively."
    );
    return;
  }

  // Check if the value matches the allowed pattern (letters, numbers, hyphens, spaces, and specific symbols)
  if (!TITLE_REGEX.test(value)) {
    callback(
      "Invalid text. Allowed characters include letters, numbers, hyphens, periods, spaces, and specific symbols."
    );
    return;
  }

  // If all checks pass, no error
  callback();
};
//validator for master names

export const validateMasterNames = (
  rule: any,
  value: string,
  callback: (error?: string) => void
) => {
  // Trim leading and trailing spaces before further validation
  const trimmedValue = value.trim();

  // Allow empty string temporarily (before user has entered a valid value)
  if (trimmedValue === "") {
    callback();
    return;
  }

  if (typeof trimmedValue !== "string") {
    callback("Text value is required and must be a string.");
    return;
  }

  // Define regex pattern for allowed characters (letters, numbers, spaces, and specific symbols)
  const TITLE_REGEX = /^[a-zA-Z0-9@._-\s&]+$/;

  // Check for disallowed combinations like </, <! and />
  const DISALLOWED_COMBINATIONS = /<\/|<\!|\/>/;

  // Check for disallowed combinations (</, <! and />)
  if (DISALLOWED_COMBINATIONS.test(trimmedValue)) {
    callback("Invalid combination: '</', '<!', and '/>' are not allowed.");
    return;
  }

  // Check if there are more than 3 consecutive special characters
  const MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS =
    /([\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s])\1{2,}/;
  if (MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS.test(trimmedValue)) {
    callback(
      "No special character should appear more than three times consecutively."
    );
    return;
  }

  // Check if the value matches the allowed pattern (letters, numbers, hyphens, spaces, and specific symbols)
  if (!TITLE_REGEX.test(trimmedValue)) {
    callback("Invalid text.");
    return;
  }

  // Check if the string ends with any disallowed file extension (.exe, .sh, .html)
  const DISALLOWED_EXTENSIONS = /\.(exe|sh|html|msi|bash)$/i;

  if (DISALLOWED_EXTENSIONS.test(trimmedValue)) {
    callback("File extensions are not allowed.");
    return;
  }

  // If all checks pass, no error
  callback();
};

export const validateUserNames = (
  rule: any,
  value: string,
  callback: (error?: string) => void
) => {
  // Trim leading and trailing spaces before further validation
  const trimmedValue = value.trim();

  // Allow empty string temporarily (before user has entered a valid value)
  if (trimmedValue === "") {
    callback();
    return;
  }

  if (typeof trimmedValue !== "string") {
    callback("Text value is required and must be a string.");
    return;
  }

  // Define regex pattern for allowed characters (letters, numbers, spaces, and specific symbols)
  const TITLE_REGEX = /^[a-zA-Z0-9@._-\s]+$/;

  // Check for disallowed combinations like </, <! and />
  const DISALLOWED_COMBINATIONS = /<\/|<\!|\/>/;

  // Check for disallowed combinations (</, <! and />)
  if (DISALLOWED_COMBINATIONS.test(trimmedValue)) {
    callback("Invalid combination: '</', '<!', and '/>' are not allowed.");
    return;
  }

  // Check if there are more than 3 consecutive special characters
  const MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS =
    /([\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s])\1{2,}/;
  if (MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS.test(trimmedValue)) {
    callback(
      "No special character should appear more than three times consecutively."
    );
    return;
  }

  // Check if the value matches the allowed pattern (letters, numbers, hyphens, spaces, and specific symbols)
  if (!TITLE_REGEX.test(trimmedValue)) {
    callback("Invalid text.");
    return;
  }

  // Check if the string ends with any disallowed file extension (.exe, .sh, .html)
  const DISALLOWED_EXTENSIONS = /\.(exe|sh|html|msi|bash)$/i;

  if (DISALLOWED_EXTENSIONS.test(trimmedValue)) {
    callback("File extensions are not allowed.");
    return;
  }

  // If all checks pass, no error
  callback();
};

//validator made for capa description which is not mandatory and not allowing to remove first character
export const validateDescription = (
  rule: any,
  value: string,
  callback: (error?: string) => void
) => {
  // Ensure the value is a string before calling trim()
  if (typeof value !== "string") {
    callback("Description must be a valid string.");
    return;
  }

  if (value.trim().length === 0) {
    callback();
    return;
  }

  // Define regex pattern for allowed characters (letters, numbers, spaces, and specific symbols)
  const DESCRIPTION_REGEX =
    /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,;:\?&%!#@€£$`'"\~]+$/;
  // Allow letters, numbers, and specific symbols

  // Check for disallowed combinations like </, <! and />
  const DISALLOWED_COMBINATIONS = /<\/|<\!|\/>/;
  if (DISALLOWED_COMBINATIONS.test(value)) {
    callback("Invalid combination: '</', '<!', and '/>' are not allowed.");
    return;
  }

  // Check if there are more than 3 consecutive special characters
  const MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS =
    /([\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~])\1{3,}/;
  if (MORE_THAN_THREE_CONSECUTIVE_SPECIAL_CHARS.test(value)) {
    callback(
      "No special character should appear more than three times consecutively."
    );
    return;
  }

  // Check if the value matches the allowed pattern (letters, numbers, spaces, and specific symbols)
  if (!DESCRIPTION_REGEX.test(value)) {
    callback(
      "Invalid text. Allowed characters include letters, numbers, hyphens, periods, spaces, and specific symbols."
    );
    return;
  }

  // If all checks pass, no error
  callback();
};

//removed three consecutive special characters check
export const validateTitleForHiraImport = (
  rule: any,
  value: string,
  callback: (error?: string) => void
) => {
  if (!value || typeof value !== "string") {
    callback("Text value is required and must be a string.");
    return;
  }

  // Define regex pattern for allowed characters (letters, numbers, spaces, and specific symbols)
  const TITLE_REGEX =
    /^[\u0000-\u007F\u0080-\uFFFFa-zA-Z0-9$&*()\-/\.,;:\?&%!#@€£$`'"\~]+$/; // Allow Unicode letters, numbers, spaces, and specific symbols

  // Check for disallowed combinations like </, <! and />
  const DISALLOWED_COMBINATIONS = /<\/|<\!|\/>/;

  // Check if the value is empty or contains only spaces
  if (!value || value.trim().length === 0) {
    callback("Text value is required.");
    return;
  }

  // Check for disallowed combinations (</, <! and />)
  if (DISALLOWED_COMBINATIONS.test(value)) {
    callback("Invalid combination: '</', '<!', and '/>' are not allowed.");
    return;
  }

  // Check if the first character is a special character
  const STARTS_WITH_SPECIAL_CHAR =
    /^[\/\-\.\$\€\£\?\&\*\(\)\%\#\!\@\`\'\"\~\s]/;
  // if (STARTS_WITH_SPECIAL_CHAR.test(value)) {
  //   callback("Text should not start with a special character.");
  //   return;
  // }

  // Check if the value matches the allowed pattern (letters, numbers, hyphens, spaces, and specific symbols)
  if (!TITLE_REGEX.test(value)) {
    callback(
      "Invalid text. Allowed characters include letters, numbers, hyphens, periods, spaces, and specific symbols."
    );
    return;
  }

  // If all checks pass, no error
  callback();
};
