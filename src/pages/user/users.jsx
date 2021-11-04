import React, { useState, useEffect, useContext } from "react";
import { Table, Form, Button, Select, Tag } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { FcUndo } from "react-icons/fc";
import { useSnackbar } from "notistack";
import ApiCallFailed from "../../components/ApiCallFailed";
import Loading from "../../components/Loading";
import { BackendAPIContext } from "../../context/BackendAPIContext";
import { API_FETCH_WAIT } from "../../util/constants";
import RefreshButton from "../../components/RefreshButton";
import ExportButton from "../../components/ExportButton";
import { getCsvHeaders } from "../../util/util";
import useWindowDimensions from "./../../hooks/useWindowDimensions";

const columns = [
  {
    title: "User Name",
    dataIndex: "userName",
    key: "userName",
    width: 220,
  },
  {
    title: "Status",
    dataIndex: "accountStatus",
    key: "accountStatus",
    width: 180,
    render: (status) => (
      <Tag
        color={status === "OPEN" ? "green" : "volcano"}
        icon={status === "OPEN" ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        key={status}
      >
        {status}
      </Tag>
    ),
  },
  {
    title: "Profile",
    dataIndex: "profile",
    key: "profile",
    width: 100,
  },
  {
    title: "Default Tablespace",
    dataIndex: "defaultTablespace",
    key: "defaultTablespace",
    width: 200,
  },
  {
    title: "Temp Tablespace",
    dataIndex: "temporaryTablespace",
    key: "temporaryTablespace",
    width: 150,
  },
  {
    title: "Created Date",
    dataIndex: "createdDate",
    key: "createdDate",
    width: 170,
  },
  {
    title: "Expiry Date",
    dataIndex: "expiryDate",
    key: "expiryDate",
    width: 170,
  },
  {
    title: "Lock Date",
    dataIndex: "lockDate",
    key: "lockDate",
    width: 170,
  },
  {
    title: "Last Login Date",
    dataIndex: "lastLogin",
    key: "lastLogin",
  },
];

const getDistinctStatus = (data) => {
  if (!data) return null;
  let statusList = [];
  data.map((row) => row.accountStatus && statusList.push(row.accountStatus));
  return ["All", ...new Set(statusList)];
};

//-------------------------------------------------------------
// PAGE START
//-------------------------------------------------------------
const Users = () => {
  const [pageLoad, setPageLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const statusList = getDistinctStatus(data);
  const [status, setStatus] = useState("All");
  const { baseUrl } = useContext(BackendAPIContext);
  const { enqueueSnackbar } = useSnackbar();
  const { height } = useWindowDimensions();

  const fetchData = async () => {
    setTimeout(() => {
      axios
        .get(`${baseUrl}/user/users`)
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
  const filteredData = data.filter((row) => (status === "All" ? true : row.accountStatus === status));
  //* display snackbar only one time on page load succeed
  if (!pageLoad) {
    setPageLoad(true);
    enqueueSnackbar(`${filteredData.length} records found.`, { variant: "info" });
  }

  return (
    <div>
      <Form form={form} layout={"inline"} size={"middle"}>
        <Form.Item label="Status" style={{ width: 240 }}>
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPageLoad(false);
            }}
          >
            {statusList.map((status) => (
              <Select.Option value={status} key={status}>
                {status}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={() => {
              setStatus("All");
              setPageLoad(false);
            }}
          >
            <FcUndo size={22} />
          </Button>
        </Form.Item>
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
                filename: "OMS_Users.csv",
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
          pageSizeOptions: [30, 50, 100, 500],
          onChange: (p, size) => {
            setPage(p);
            setPageSize(size);
          },
        }}
        scroll={{ x: 1620, y: height - 270 }}
        rowKey="userName"
      />
    </div>
  );
};

export default Users;
