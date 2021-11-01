import React, { useState, useEffect, useContext } from "react";
import { Table, Form, Button, Select, Tag, Tabs, Row, Col, Tooltip } from "antd";
import { TableOutlined, AimOutlined } from "@ant-design/icons";
import axios from "axios";
import { useSnackbar } from "notistack";
import { FcUndo } from "react-icons/fc";
import { withStyles } from "@mui/styles";
import { formatNumberWithCommas } from "../../util/util";
import Loading from "../../components/Loading";
import { BackendAPIContext } from "../../context/BackendAPIContext";
import ApiCallFailed from "../../components/ApiCallFailed";
import { API_FETCH_WAIT } from "../../util/constants";
import RefreshButton from "../../components/RefreshButton";
import ExportButton from "../../components/ExportButton";
import { getCsvHeaders } from "../../util/util";
import TableRecordsChart from "../../chart/TableRecordsChart";

const columns = [
  {
    title: "Owner",
    dataIndex: "owner",
    key: "owner",
    width: 200,
  },
  {
    title: "Table Name",
    dataIndex: "tableName",
    key: "tableName",
    width: 300,
  },
  {
    title: "Total Records",
    dataIndex: "totalRecords",
    key: "totalRecords",
    align: "right",
    width: 200,
    sorter: (a, b) => a.totalRecords - b.totalRecords,
    render: (value) => {
      let style = "default";
      if (value === 0) style = "default";
      else if (value < 10000) style = "green";
      else style = "gold";
      return (
        <Tag color={style} key={value}>
          {formatNumberWithCommas(value)}
        </Tag>
      );
    },
  },
  {
    title: "Tablespace Name",
    dataIndex: "tablespace",
    key: "tablespace",
  },
];

const getDistinctOwners = (data) => {
  if (!data) return null;
  let owners = [];
  data.map((row) => row.owner && owners.push(row.owner));
  return ["All", ...new Set(owners)];
};

const TabPane = Tabs.TabPane;

//-------------------------------------------------------------
//* STYLES START
//-------------------------------------------------------------
const styles = {
  root: {},
  chartContainer: {
    height: "2000px",
    width: "100%",
  },
};

//-------------------------------------------------------------
// PAGE START
//-------------------------------------------------------------
const TableRecords = ({ classes }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const ownerList = getDistinctOwners(data);
  const [owner, setOwner] = useState("All");
  const { baseUrl } = useContext(BackendAPIContext);
  const { enqueueSnackbar } = useSnackbar();

  const fetchData = async () => {
    setTimeout(() => {
      axios
        .get(`${baseUrl}/space/tablerecords`)
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
  const filteredData = data.filter((row) => (owner === "All" ? true : row.owner === owner));
  enqueueSnackbar(`${filteredData.length} records found.`, { variant: "info" });

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
            <Form.Item label="Owner" style={{ width: 200 }}>
              <Select
                value={owner}
                onChange={(value) => {
                  setOwner(value);
                }}
              >
                {ownerList.map((owner) => (
                  <Select.Option value={owner} key={owner}>
                    {owner}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Tooltip placement="right" title="CLEAR">
                <Button
                  onClick={() => {
                    setOwner("All");
                  }}
                >
                  <FcUndo size={22} />
                </Button>
              </Tooltip>
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
                    data: data,
                    headers: getCsvHeaders(columns),
                    filename: "OMS_TableRecords.csv",
                  }}
                />
              </Form.Item>
            </div>
          </Form>
          <Table
            style={{ marginTop: 10 }}
            columns={columns}
            dataSource={filteredData}
            bordered
            size="small"
            pagination={{
              page: page,
              pageSize: pageSize,
              position: ["bottomRight"],
              pageSizeOptions: [10, 15, 30, 100, 500],
              onChange: (p, size) => {
                setPage(p);
                setPageSize(size);
              },
            }}
            scroll={{ x: 1000 /*, y: 620 */ }}
            rowKey="tableName"
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <AimOutlined />
              Top 100 Tables
            </span>
          }
          key="chart"
        >
          <Row>
            <Col lg={24} xl={24} xxl={24}>
              <div className={classes.chartContainer}>
                <TableRecordsChart data={data} limit={100} />
              </div>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default withStyles(styles)(TableRecords);
