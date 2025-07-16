export function convertDate(dateStr:any):string{
    const timestamp = dateStr;

// Create a new Date object using the timestamp
const dateObject = new Date(timestamp);

// Extract the day, month, date, and year from the date object
const day = dateObject.toLocaleString('en-US', { weekday: 'short' });
const month = dateObject.toLocaleString('en-US', { month: 'long' });
const date = dateObject.getDate();
const year = dateObject.getFullYear();

// Construct the final date string in the desired format
const formattedDate = `${day}, ${month} ${date}, ${year}`;
return formattedDate
}