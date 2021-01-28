import React, { useState } from "react";

//Stores the collection id of the current collection
export const CurrCollContext = React.createContext(null);

export const CurrCollContextProvider = (props) => {

    const [currColl, setCurrColl] = useState("Uncategorized");

    return(
        <CurrCollContext.Provider value={{currColl, setCurrColl}}>
            {props.children}
        </CurrCollContext.Provider>
    )
}