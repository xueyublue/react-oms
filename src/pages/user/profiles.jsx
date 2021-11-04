import React, { useState, useEffect, useContext } from "react";
import { Table, Form, Button, Select, Tag } from "antd";
import axios from "axios";
import { FcUndo } from "react-icons/fc";
import { useSnackbar } from "notistack";
import ApiCallFailed from "../../components/ApiCallFailed";
import Loading from "../../components/Loading";
import { getCsvHeaders } from "../../util/util";
import { BackendAPIContext } from "../../context/BackendAPIContext";
import { API_FETCH_WAIT } from "../../util/constants";
import RefreshButton from "../../components/RefreshButton";
import ExportButton from "../../components/ExportButton";
import useWindowDimensions from "./../../hooks/useWindowDimensions";

const columns = [
  {
    title: "Profile",
    dataIndex: "profile",
    key: "profile",
    width: 160,
  },
  {
    title: "Resource Name",
    dataIndex: "resourceName",
    key: "resourceName",
    width: 300,
  },
  {
    title: "Resource Type",
    dataIndex: "resourceType",
    key: "resourceType",
    width: 140,
  },
  {
    title: "Limit",
    dataIndex: "limit",
    key: "limit",
    render: (limit) => (
      <Tag color={limit === "Unlimited" ? "green" : limit === "Default" ? "geekblue" : "volcano"} key={limit}>
        {limit}
      </Tag>
    ),
  },
];

const getDistinctProfiles = (data) => {
  if (!data) return null;
  let profiles = [];
  data.map((row) => row.profile && profiles.push(row.profile));
  return ["All", ...new Set(profiles)];
};

//-------------------------------------------------------------
// PAGE START
//-------------------------------------------------------------
const Profiles = () => {
  const [pageLoad, setPageLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const profileList = getDistinctProfiles(data);
  const [profile, setProfile] = useState("All");
  const { baseUrl } = useContext(BackendAPIContext);
  const { enqueueSnackbar } = useSnackbar();
  const { height } = useWindowDimensions();

  const fetchData = async () => {
    setTimeout(() => {
      axios
        .get(`${baseUrl}/user/profiles`)
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
  const filteredData = data.filter((row) => (profile === "All" ? true : row.profile === profile));
  //* display snackbar only one time on page load succeed
  if (!pageLoad) {
    setPageLoad(true);
    enqueueSnackbar(`${filteredData.length} records found.`, { variant: "info" });
  }

  return (
    <div>
      <Form form={form} layout={"inline"} size={"middle"}>
        <Form.Item label="Profile" style={{ width: 240 }}>
          <Select
            value={profile}
            onChange={(value) => {
              setProfile(value);
              setPageLoad(false);
            }}
          >
            {profileList.map((profile) => (
              <Select.Option value={profile} key={profile}>
                {profile}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={() => {
              setProfile("All");
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
                filename: "OMS_Profiles.csv",
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
        scroll={{ x: 800, y: height - 270 }}
        rowKey="resourceName"
      />
    </div>
  );
};

export default Profiles;
