import React, { useState, useEffect, useContext } from "react";
import { Table, Progress, Form, Row, Col, Tag, Tabs, Select } from "antd";
import axios from "axios";
import { useSnackbar } from "notistack";
import { ExclamationCircleOutlined, TableOutlined, AreaChartOutlined } from "@ant-design/icons";
import { formatNumberWithCommasAndDecimals } from "../../util/util";
import Loading from "../../components/Loading";
import ApiCallFailed from "../../components/ApiCallFailed";
import { BackendAPIContext } from "../../context/BackendAPIContext";
import { API_FETCH_WAIT } from "../../util/constants";
import RefreshButton from "../../components/RefreshButton";
import ExportButton from "../../components/ExportButton";
import { getCsvHeaders } from "../../util/util";
import SgaDoughnutChart from "../../chart/SgaDoughnutChart";
import SgaBarChart from "./../../chart/SgaBarChart";
import { withStyles } from "@mui/styles";
import useWindowDimensions from "./../../hooks/useWindowDimensions";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: 250,
  },
  {
    title: "Size",
    dataIndex: "size",
    key: "size",
    width: 180,
    align: "right",
    render: (value) => formatNumberWithCommasAndDecimals(value),
    sorter: (a, b) => a.size - b.size,
  },
  {
    title: "Percentage%",
    dataIndex: "percentage",
    key: "percentage",
    render: (percentage) => (
      <div>
        <Progress
          percent={percentage}
          status={percentage >= 80 ? "exception" : "normal"}
          strokeLinecap="square"
          format={(percentage) => `${percentage}`}
        />
      </div>
    ),
    sorter: (a, b) => a.percentage - b.percentage,
  },
];

const TabPane = Tabs.TabPane;

//-------------------------------------------------------------
//* STYLES START
//-------------------------------------------------------------
const styles = {
  root: {},
  chartContainer: {
    width: "100%",
  },
  tag: {
    fontSize: "1rem",
    padding: "5px",
  },
};

//-------------------------------------------------------------
//* PAGE START
//-------------------------------------------------------------
const SgaConfigurations = ({ classes }) => {
  const [pageLoad, setPageLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [chartType, setChartType] = useState("linear");
  const { baseUrl } = useContext(BackendAPIContext);
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const { height } = useWindowDimensions();

  const fetchData = async () => {
    setTimeout(() => {
      axios
        .get(`${baseUrl}/instance/sgaconfig`)
        .then(({ data }) => {
          setData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setData(null);
          setIsLoading(false);
          console.log(err);
        });
    }, API_FETCH_WAIT);
  };

  useEffect(() => {
    fetchData();
  }, [baseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loading />;
  if (!data) return <ApiCallFailed />;
  //* display snackbar only one time on page load succeed
  if (!pageLoad) {
    setPageLoad(true);
    enqueueSnackbar(`${data.table.length} records found.`, { variant: "info" });
  }
  let chartContainerHeight = height - 190;
  if (chartContainerHeight <= 300) chartContainerHeight = 300;

  return (
    <div>
      <Tabs type="card">
        <TabPane
          tab={
            <span>
              <TableOutlined />
              Table
            </span>
          }
          key="table"
        >
          <Form form={form} layout={"inline"} size={"middle"}>
            <Form.Item>
              <Tag className={classes.tag} icon={<ExclamationCircleOutlined />} color={"geekblue"}>
                System Global Area (SGA): {data.maxSgaSize} MB in total.
              </Tag>
            </Form.Item>
            <div style={{ position: "absolute", right: 0 }}>
              <Form.Item>
                <RefreshButton
                  onClick={() => {
                    setIsLoading(true);
                    fetchData();
                  }}
                />
                <ExportButton
                  csvReport={{
                    data: data.table,
                    headers: getCsvHeaders(columns),
                    filename: "OMS_SGA.csv",
                  }}
                />
              </Form.Item>
            </div>
          </Form>
          <Row>
            <Col lg={24} xl={24}>
              <Table
                style={{ marginTop: 10 }}
                columns={columns}
                dataSource={data.table}
                bordered
                size="small"
                pagination={{ pageSize: 15, position: ["none"] }}
                rowKey="name"
              />
            </Col>
          </Row>
        </TabPane>
        <TabPane
          tab={
            <span>
              <AreaChartOutlined />
              Chart
            </span>
          }
          key="chart"
        >
          <Row>
            <Col lg={24} xl={12} xxl={12}>
              <Form.Item label="Chart Type" style={{ width: 200 }}>
                <Select
                  value={chartType}
                  onChange={(value) => {
                    setChartType(value);
                  }}
                >
                  {["Linear", "Logarithmic"].map((value) => (
                    <Select.Option value={value.toLowerCase()} key={value}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <div className={classes.chartContainer} style={{ height: chartContainerHeight - 60 }}>
                <SgaBarChart data={data} chartType={chartType} />
              </div>
            </Col>
            <Col lg={24} xl={12} xxl={12}>
              <div className={classes.chartContainer} style={{ height: chartContainerHeight }}>
                <SgaDoughnutChart data={data} />
              </div>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default withStyles(styles)(SgaConfigurations);
