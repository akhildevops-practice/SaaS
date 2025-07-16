const getYearinYYYYformat = async (yearString: any) => {
  // Ensure the input is a string
  yearString = yearString.toString();

  // For format: yyyy
  if (/^\d{4}$/.test(yearString)) {
    return yearString;
  }

  // For format: yy - yy+1
  if (/^\d{2}-\d{2}$/.test(yearString)) {
    const [start] = yearString.split("-").map((y: any) => parseInt(y, 10));
    return `20${start}`;
  }

  // For format: yyyy- yy+1
  if (/^\d{4}-\d{2}$/.test(yearString)) {
    const [start] = yearString.split("-");
    return start;
  }

  // For format: yy+1
  if (/^\d{2}$/.test(yearString)) {
    const year = parseInt(yearString, 10);
    return `20${year}`;
  }

  throw new Error("Invalid year format");
};
export default getYearinYYYYformat;
