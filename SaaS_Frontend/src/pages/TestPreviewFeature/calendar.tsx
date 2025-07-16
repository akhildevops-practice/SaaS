import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import dayLocaleData from 'dayjs/plugin/localeData';
import { Calendar, Col, Radio, Row, Select, Typography, theme } from 'antd';

dayjs.extend(dayLocaleData);

const TestCalendar: React.FC = () => {
  const { token } = theme.useToken();
  const [selectedDates, setSelectedDates] = useState<Dayjs[]>([]);

  const onDateSelect = (value: Dayjs) => {
    const index = selectedDates.findIndex(date => date.isSame(value, 'day'));
    if (index !== -1) {
      // Remove date from array
      setSelectedDates(prev => prev.filter((_, i) => i !== index));
    } else {
      // Add date to array
      setSelectedDates(prev => [...prev, value]);
    }
  };

  const dateCellRender = (value: Dayjs) => {
    if (selectedDates.some(date => date.isSame(value, 'day'))) {
      return (
        <div
          style={{
            borderRadius: '50%',
            backgroundColor: '#1890ff',
            color: 'white',
            padding: '4px 0',
            textAlign: 'center'
          }}
        >
          {value.date()}
        </div>
      );
    }
  };

  const wrapperStyle: React.CSSProperties = {
    width: 300,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
  };

  const headerRender = ({ value, type, onChange, onTypeChange }: any) => {
    const start = 0;
    const end = 12;
    const monthOptions: React.ReactNode[] = [];

    let current: Dayjs = value.clone();
    const localeData = value.localeData();
    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      current = current.month(i);
      months.push(localeData.monthsShort(current));
    }

    for (let i = start; i < end; i++) {
      monthOptions.push(
        <Select.Option key={i} value={i} className="month-item">
          {months[i]}
        </Select.Option>
      );
    }

    const year = value.year();
    const month = value.month();
    const options: React.ReactNode[] = [];
    for (let i = year - 10; i < year + 10; i += 1) {
      options.push(
        <Select.Option key={i} value={i} className="year-item">
          {i}
        </Select.Option>
      );
    }

    return (
      <div style={{ padding: 8 }}>
        <Typography.Title level={4}>Custom header</Typography.Title>
        <Row gutter={8}>
          <Col>
            <Radio.Group
              size="small"
              onChange={(e) => onTypeChange(e.target.value)}
              value={type}
            >
              <Radio.Button value="month">Month</Radio.Button>
              <Radio.Button value="year">Year</Radio.Button>
            </Radio.Group>
          </Col>
          <Col>
            <Select
              size="small"
              dropdownMatchSelectWidth={false}
              className="my-year-select"
              value={year}
              onChange={(newYear: number) => {
                const now = value.clone().year(newYear);
                onChange(now);
              }}
            >
              {options}
            </Select>
          </Col>
          <Col>
            <Select
              size="small"
              dropdownMatchSelectWidth={false}
              value={month}
              onChange={(newMonth: number) => {
                const now = value.clone().month(newMonth);
                onChange(now);
              }}
            >
              {monthOptions}
            </Select>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div style={wrapperStyle}>
      <Calendar
        fullscreen={false}
        headerRender={headerRender}
        onSelect={onDateSelect}
        dateCellRender={dateCellRender}
      />
    </div>
  );
};

export default TestCalendar;
