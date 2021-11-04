import React, { useState, useEffect, useContext } from "react";
import { Table, Tag, Form } from "antd";
import axios from "axios";
import { useSnackbar } from "notistack";
import Loading from "../../components/Loading";
import { BackendAPIContext } from "../../context/BackendAPIContext";
import { API_FETCH_WAIT } from "../../util/constants";
import RefreshButton from "../../components/RefreshButton";
import ExportButton from "../../components/ExportButton";
import { getCsvHeaders } from "../../util/util";
import useWindowDimensions from "./../../hooks/useWindowDimensions";

const columns = [
  {
    title: "Parameter Name",
    dataIndex: "name",
    key: "name",
    width: 300,
    fixed: "left",
  },
  {
    title: "Value",
    dataIndex: "value",
    key: "value",
    fixed: "left",
    width: 300,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    width: 500,
  },
  {
    title: "Default?",
    dataIndex: "isDefault",
    key: "isDefault",
    width: 160,
    render: (value) => (
      <Tag color={value === "True" ? "green" : "geekblue"} key={value}>
        {value}
      </Tag>
    ),
  },
  {
    title: "Session Modificable?",
    dataIndex: "isSessionModifiable",
    key: "isSessionModifiable",
    width: 180,
    render: (value) => (
      <Tag color={value === "True" ? "green" : "geekblue"} key={value}>
        {value}
      </Tag>
    ),
  },
  {
    title: "System Modifucable?",
    dataIndex: "isSystemModifiable",
    key: "isSystemModifiable",
    width: 180,
    render: (value) => (
      <Tag color={value === "True" ? "green" : "geekblue"} key={value}>
        {value}
      </Tag>
    ),
  },
  {
    title: "Instance Modificable?",
    dataIndex: "isInstanceModifiable",
    key: "isInstanceModifiable",
    width: 180,
    render: (value) => (
      <Tag color={value === "True" ? "green" : "geekblue"} key={value}>
        {value}
      </Tag>
    ),
  },
];

//-------------------------------------------------------------
// PAGE START
//-------------------------------------------------------------
const Parameters = () => {
  const [pageLoad, setPageLoad] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const { baseUrl } = useContext(BackendAPIContext);
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const { height } = useWindowDimensions();

  const fetchData = async () => {
    setTimeout(() => {
      axios
        .get(`${baseUrl}/instance/parameters`)
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
  //* display snackbar only one time on page load succeed
  if (!pageLoad) {
    setPageLoad(true);
    enqueueSnackbar(`${data.length} records found.`, { variant: "info" });
  }

  return (
    <div>
      <Form form={form} layout={"inline"} size={"middle"}>
        <Form.Item />
        <div style={{ position: "absolute", right: 0 }}>
          <Form.Item>
            <RefreshButton
              onClick={() => {
                setIsLoading(true);
                fetchData();
                setPageLoad(false);
              }}
            />
            <ExportButton
              csvReport={{
                data: data,
                headers: getCsvHeaders(columns),
                filename: "OMS_Parameters.csv",
              }}
            />
          </Form.Item>
        </div>
      </Form>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        size="small"
        pagination={{
          page: page,
          pageSize: pageSize,
          position: ["bottomRight"],
          pageSizeOptions: [30, 50, 100, 500],
          onChange: (p, size) => {
            setPage(p);
            setPageSize(size);
          },
        }}
        scroll={{ x: 1700, y: height - 260 }}
        rowKey="name"
      />
    </div>
  );
};

export default Parameters;
