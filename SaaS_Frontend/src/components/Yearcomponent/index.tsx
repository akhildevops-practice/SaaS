import React, { useEffect } from "react";
import { MdArrowLeft } from "react-icons/md";
import { MdArrowRight } from "react-icons/md";

import { Typography } from "antd";

const { Text } = Typography;

type Props = {
  currentYear: any;
  setCurrentYear: any;
};

const YearComponent = ({ currentYear, setCurrentYear }: Props) => {
  useEffect(() => {
    // getYear();
  }, []);

  function adjustYear(yearString: any, offset: any) {
    yearString = yearString.toString();

    if (/^\d{4}$/.test(yearString)) {
      const year = parseInt(yearString, 10) + offset;
      return year.toString();
    }

    if (/^\d{2}-\d{2}$/.test(yearString)) {
      let [start, end] = yearString.split("-").map((y: any) => parseInt(y, 10));
      start += offset;
      end += offset;
      return `${start}-${end}`;
    }

    if (/^\d{4}-\d{2}$/.test(yearString)) {
      const [start, end] = yearString.split("-");
      const fullStart = parseInt(start, 10);
      const fullEnd = parseInt(start.slice(0, 2) + end, 10) + offset;
      return `${fullStart + offset}-${fullEnd.toString().slice(-2)}`;
    }

    if (/^\d{2}$/.test(yearString)) {
      const year = parseInt(yearString, 10) + offset;
      return year.toString().slice(-2);
    }

    throw new Error("Invalid year format");
  }

  const changeYear = (offset: any) => {
    const year = adjustYear(currentYear, offset);
    setCurrentYear(year);
  };

  return (
    <div
      className="year-component"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "3px 0px 0px 13px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => changeYear(-1)}
      >
        <MdArrowLeft
          style={{
            width: "40px",
            height: "40px",
          }}
        />
      </div>

      <Text
        style={{
          fontSize: "16px",
          fontFamily: "poppinsregular",
          padding: 5,
          margin: 0,
          color: "#246dc1",
          // fontWeight: 600,
        }}
      >
        {currentYear}
      </Text>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => changeYear(1)}
      >
        <MdArrowRight
          style={{
            width: "40px",
            height: "40px",
          }}
        />
      </div>
    </div>
  );
};

export default YearComponent;
