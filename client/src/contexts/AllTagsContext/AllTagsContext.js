import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {AuthContext} from "../AuthContext/AuthContext";
import {CurrCollContext} from "../CurrCollContext/CurrCollContext";

export const AllTagsContext = React.createContext(null);

export const AllTagsContextProvider = (props) => {

    const [allTags, setAllTags] = useState([]);
    const [idsAndTags, setIdsAndTags] = useState([]);
    const [searchTags, setSearchTags] = useState([]);
    const {auth, setAuth} = useContext(AuthContext);
    const {currColl, setCurrColl} = useContext(CurrCollContext);

    //This function helps make all elements in an array unique
    function arrMakeUnique(array){
        return Array.from(new Set(array))
    }

    async function getTagsOfCollection(){
        if(auth && currColl[0].collection_name !== 0){
        await axios.get(`/api/v1/getAllTags?userID=${auth.uid}&collectionID=${currColl[0].collection_id}`)
        .then((res) => {
            const allTagsArr = res.data.data;
            setIdsAndTags(allTagsArr);
            allTagsArr.forEach((each) => {
                const eachArr = each?.tags;
                if(eachArr){
                    eachArr.forEach((tag) => {
                    setAllTags((prev) => {
                        return arrMakeUnique([...prev, tag])
                    })
                    let searchObj = {};
                    searchObj["label"] = tag;
                    searchObj["value"] = tag;
                    setSearchTags((prev) => {
                        return arrMakeUnique([...prev, searchObj])
                    })
                })
                }
            })
        })
        }else if(currColl[0].collection_id === 0){
            setAllTags([])
        }
    }

    useEffect(() => {
        setAllTags([])
        setSearchTags([]);
        getTagsOfCollection();
    }, [currColl])

    return(
        <AllTagsContext.Provider value={{
            allTags, setAllTags, arrMakeUnique, searchTags, setSearchTags, idsAndTags, setIdsAndTags, getTagsOfCollection
            }}>
            {props.children}
        </AllTagsContext.Provider>
    )
}