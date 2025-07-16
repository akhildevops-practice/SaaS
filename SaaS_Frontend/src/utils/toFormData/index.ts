/**
 * @method toFormData
 * @description Function to convert image to form data
 * @param data The data to be converted to FormData
 * @returns The data converted to form data, to be used when sending files to backend
 */

function toFormData(data: any) {
  const form = new FormData();
  for (const item in data) {
    const element = data[item];
    Array.isArray(element)
      ? element.forEach((val, index) => {
          if (typeof val == "object") {
            for (const key in val) {
              const element = val[key];
              form.append(`${item}[${index}][${key}]`, element);
            }
          } else {
            form.append(`${item}[${index}]`, val);
          }
        })
      : form.append(item, element);
  }
  return form;
}

export default toFormData;
