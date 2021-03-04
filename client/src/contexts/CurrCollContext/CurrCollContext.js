import React, { useState, useEffect } from "react";
import axios from "axios";

//Stores the collection id of the current collection
export const CurrCollContext = React.createContext(null);

export const CurrCollContextProvider = (props) => {

    const [currColl, setCurrColl] = useState([{
                collection_id : "0",
                collection_name : "Uncategorized"
            }]);

    // useEffect(() => {
    //     localStorage.setItem('current collection', JSON.stringify(currColl))
    // }, [currColl]);

    // useEffect(() => {
    //     const storedColl = localStorage.getItem('current collection');
    //     if(storedColl){
    //         setCurrColl(JSON.parse(storedColl));
    //     }else{
    //         setCurrColl([{
    //             collection_id : "0",
    //             collection_name : "Uncategorized"
    //         }]);
    //     }
    // }, []);

    return(
        <CurrCollContext.Provider value={{currColl, setCurrColl}}>
            {props.children}
        </CurrCollContext.Provider>
    )
}