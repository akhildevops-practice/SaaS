import { IconButton, Tooltip, useMediaQuery } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { ReactComponent as CreateIcon } from "../../../assets/MRM/addIcon.svg";
import { AiOutlineMinusCircle } from "react-icons/ai";
interface DateTimeRange {
  date: string;
  from: string;
  to: string;
}

type Props = {
  formData?: any;
  handleDateRange: any;
  readStatus?: any;
  setFormData?: any;
};

function DateTimeRangeSelector({
  formData,
  handleDateRange,
  readStatus,
  setFormData,
}: Props) {
  const [dateTimeRanges, setDateTimeRanges] = useState<DateTimeRange[]>([
    { date: "", from: "", to: "" },
  ]);
  const matches = useMediaQuery("(min-width:786px)");
  useEffect(() => {
    if (formData?.date) {
      setDateTimeRanges(formData?.date);
    }
  }, [formData?.date]);

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
    key: keyof DateTimeRange
  ) => {
    const { value } = event.target;

    const updatedDateTimeRanges = [...dateTimeRanges];
    updatedDateTimeRanges[index][key] = value;

    if (key === "to") {
      const fromTime = updatedDateTimeRanges[index]["from"];
      const isInvalidTime = isBeforeFromTime(fromTime, value);
      if (isInvalidTime) {
        return;
      }
    }

    setDateTimeRanges(updatedDateTimeRanges);
    const updatedFormData = { ...formData };
    updatedFormData.date = updatedDateTimeRanges;
    setFormData(updatedFormData);
  };

  const isBeforeFromTime = (fromTime: string, toTime: string) => {
    const [fromHours, fromMinutes] = fromTime.split(":").map(Number);
    const [toHours, toMinutes] = toTime.split(":").map(Number);

    return (
      fromHours > toHours || (fromHours === toHours && fromMinutes >= toMinutes)
    );
  };

  const handleAddRow = () => {
    setDateTimeRanges([...dateTimeRanges, { date: "", from: "", to: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    const updatedDateTimeRanges = [...dateTimeRanges];
    updatedDateTimeRanges.splice(index, 1);
    setDateTimeRanges(updatedDateTimeRanges);
    const updatedFormData = { ...formData };
    updatedFormData.date = updatedDateTimeRanges;
    setFormData(updatedFormData);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      {dateTimeRanges.map((dateTimeRange, index) => (
        <div
          key={index}
          style={{
            marginBottom: "10px",
            display: "flex",
            gap: "10px",
            flexDirection: matches ? "row" : "column",
          }}
        >
          <input
            type="date"
            value={dateTimeRange.date}
            disabled={readStatus}
            // min={today}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "200px",
              backgroundColor: readStatus === true ? "white" : "#FAFAFA",
            }}
            onChange={(e) => handleInputChange(index, e, "date")}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="time"
              value={dateTimeRange.from}
              placeholder="From"
              step={300} // Step of 5 minutes
              style={{
                padding: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100px",
                backgroundColor: readStatus === true ? "white" : "#FAFAFA",
              }}
              disabled={readStatus}
              onChange={(e) => handleInputChange(index, e, "from")}
            />
            <input
              type="time"
              value={dateTimeRange.to}
              placeholder="To"
              step={300} // Step of 5 minutes
              disabled={readStatus}
              style={{
                padding: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100px",
                backgroundColor: readStatus === true ? "white" : "#FAFAFA",
              }}
              onChange={(e) => handleInputChange(index, e, "to")}
            />
            {dateTimeRanges.length > 1 && (
              <Tooltip title="Remove Date">
                <IconButton
                  onClick={() => {
                    handleRemoveRow(index);
                  }}
                  style={{ fontSize: "20px" }}
                  disabled={readStatus}
                >
                  <AiOutlineMinusCircle
                    style={{ fontSize: "16px", color: " #002b80" }}
                  />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Add Date">
              <IconButton
                disabled={readStatus}
                onClick={() => {
                  handleAddRow();
                }}
              >
                <CreateIcon style={{ fontSize: "15px" }} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DateTimeRangeSelector;
