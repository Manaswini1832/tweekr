import React, { useState } from "react"

export const CollecNamesContext = React.createContext(null);

export const CollecNamesContextProvider = (props) => {

    //Should get these collection names from Postgres DB
    const [collecNames, setCollecNames] = useState(["Uncategorized", "ML", "Freelancing", "Finance"]);

    return(
        <CollecNamesContext.Provider value={{collecNames, setCollecNames}}>
            {props.children}
        </CollecNamesContext.Provider>
    )
}