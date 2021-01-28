import React, { useState } from "react";

export const AuthContext = React.createContext(null);

export const AuthContextProvider = (props) => {

    const [auth, setAuth] = useState(null);

    return(
        <AuthContext.Provider value={{auth, setAuth}}>
            {props.children}
        </AuthContext.Provider>
    )
}