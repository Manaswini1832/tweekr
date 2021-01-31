import React, { useState, useEffect, useContext } from "react";
import { Route, Link } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "./contexts/AuthContext/AuthContext";

const PrivateRoute = ({ component: RouteComponent, ...rest }) => {

    const [show, setShow] = useState(null);
    const {auth, setAuth} = useContext(AuthContext);

    useEffect(() => {
        validateEntry();
    }, []);

    async function validateEntry(){
        await 
        axios.get("/api/v1/validateEntry")
        .then((res) => {
            if(res.data.message === "Success. Redirect now"){
              setAuth(res.data.details);
              setShow(true);
            }else{
                setShow(false);
            }
        })
    }
  return (
    <Route
      {...rest}
      render={routeProps =>
        show ? (
          <RouteComponent {...routeProps} />
        ) : <div>Not authorized to access this page <Link to="/"><button>Go back to login page</button></Link></div>
      }
    />
  );
};


export default PrivateRoute;