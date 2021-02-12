import React, { useState, useEffect, useContext } from "react"
import axios from "axios";
import {AuthContext} from "../AuthContext/AuthContext";

export const CollecNamesContext = React.createContext(null);

export const CollecNamesContextProvider = (props) => {

    const {auth, setAuth} = useContext(AuthContext);

    //Should get these collection names from Postgres DB
    const [collecNames, setCollecNames] = useState([{
        collection_id : "0",
        collection_name : "Uncategorized"
    }]);

    useEffect(() => {
        if(auth){
            getCollections();
        }
    }, [auth]);

    async function getCollections(){
           if(auth){
            await axios.get(`/api/v1/collections/${auth.uid}`)
            .then((res) => {
                console.log(res.data.data)
                const data = res.data.data;
                data.unshift({
                    collection_id : "0",
                    collection_name : "Uncategorized"
                })
                setCollecNames(data)
            })
           }
    }

    return(
        <CollecNamesContext.Provider value={{collecNames, setCollecNames}}>
            {props.children}
        </CollecNamesContext.Provider>
    )
}