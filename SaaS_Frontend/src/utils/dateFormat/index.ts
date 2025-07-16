const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const dateToLongDateFormat = (date: Date) => {
  return (
    date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear()
  );
};
