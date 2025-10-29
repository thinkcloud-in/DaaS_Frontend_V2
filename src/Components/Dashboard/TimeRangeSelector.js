import dayjs from "dayjs";
import { DatePicker, Space } from "antd";
import "./css/TimeRangeSelector.css";
import { useContext } from "react";
import { GrafanaToolbarContext } from "../../Context/GrafanaToolbarContext";
const { RangePicker } = DatePicker;

const TimeRangeSelector = () => {
  let { rangePresets, onRangeChange, dateRange } = useContext(
    GrafanaToolbarContext
  );
  return (
    <Space direction="vertical" size={12}>
      <RangePicker
        presets={[
          {
            key: "beginningOfDayToNow",
            label: "BOD ~ Now",
            value: () => [dayjs().startOf("day"), dayjs()],
          },
          ...rangePresets,
        ]}
        showTime
        format="YYYY-MM-DD HH:mm:00:000"
        defaultValue={[dayjs().startOf("day"), dayjs()]}
        value={[dateRange.startDate, dateRange.endDate]}
        onChange={onRangeChange}
        style={{
          border: "1px solid grey",
          
        }}
      />
    </Space>
  );
};
export default TimeRangeSelector;
