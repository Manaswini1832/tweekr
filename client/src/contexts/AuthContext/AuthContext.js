import React, { useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = React.createContext(null);

export const AuthContextProvider = (props) => {

    const [auth, setAuth] = useState(null);

    useEffect(() => {
        setUserDetailsPGDB();
    }, [auth]);

    async function setUserDetailsPGDB(){
        await axios.post("/api/v1/setUser", {
            userInfo :{
                auth
            }
        })
    }

    return(
        <AuthContext.Provider value={{auth, setAuth}}>
            {props.children}
        </AuthContext.Provider>
    )
}