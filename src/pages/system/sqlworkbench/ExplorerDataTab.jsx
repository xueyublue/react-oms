import React, { useContext, useState, useEffect } from "react";
import { withStyles } from "@mui/styles";
import axios from "axios";
import { Spin } from "antd";
import useWindowDimensions from "../../../hooks/useWindowDimensions";
import { BackendAPIContext } from "../../../context/BackendAPIContext";
import { API_FETCH_WAIT } from "../../../util/constants";
import SqlResultTable from "./SqlResultTable";

//-------------------------------------------------------------
//* STYLES START
//-------------------------------------------------------------
const styles = {
  root: {
    width: "100%",
    height: "100%",
    marginTop: -17,
  },
};

//-------------------------------------------------------------
// COMPONENT START
//-------------------------------------------------------------
function ExplorerDataTab({ classes, table }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const { height } = useWindowDimensions();
  const { baseUrl } = useContext(BackendAPIContext);

  const Loading = (props) => (
    <Spin
      size="large"
      tip="&nbsp;&nbsp;Loading..."
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "col",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );

  const fetchData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      axios
        .get(`${baseUrl}/sql/data`, { params: { table } })
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
  }, [baseUrl, table]); // eslint-disable-line react-hooks/exhaustive-deps

  console.log(data);

  return (
    <div className={classes.root} style={{ height: height - 211 }}>
      {isLoading ? <Loading /> : data ? <SqlResultTable height={height - 245} result={data[0]} /> : null}
    </div>
  );
}

export default withStyles(styles)(ExplorerDataTab);
