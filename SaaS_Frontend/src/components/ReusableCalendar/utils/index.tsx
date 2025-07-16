import moment from "moment";
import "moment-timezone";
import { Select } from "antd";
export const utcToIst = (datetime:any) => {
  const momentTime = moment.utc(datetime);
  const istTime = momentTime
    .clone()
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss");
  return istTime;
};

export const istToUtc = (datetime:any) => {
  const momentTime = moment(datetime).tz("Asia/Kolkata");
  const utcTime = momentTime.clone().utc().format("YYYY-MM-DD HH:mm:ss");
  return utcTime;
};

export const colors = [
  "hotpink", //default kalend color
  "orange", //light orange - tomato
  "dodgerblue", //dodgerblue
  "orchid", //orchid
  "lightseagreen", //sea green
  "sandybrown", //brown
  "bisque", //bisque
];

export const ColorSelect = () => {
  return (
    <>
      {[
        { value: "hotpink", label: "Pink" },
        { value: "orange", label: "Orange" },
        { value: "dodgerblue", label: "Blue" },
        { value: "orchid", label: "Orchid" },
        { value: "lightseagreen", label: "Green" },
        { value: "sandybrown", label: "Brown" },
        { value: "bisque", label: "Bisque" },
      ].map((e) => (
        <Select.Option value={e.value}>
          {" "}
          <span
            style={{
              display: "inline-block",
              width: "15px",
              height: "15px",
              backgroundColor: `${e.value}`,
              marginRight: "10px",
              verticalAlign: "middle",
            }}
          />{" "}
          {e.label}{" "}
        </Select.Option>
      ))}
    </>
  );
};
