import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {AllTagsContext} from "../AllTagsContext/AllTagsContext";

export const SearchTweetIdsContext = React.createContext(null);

export const SearchTweetIdsContextProvider = (props) => {

    // const {allTags, setAllTags, arrMakeUnique, searchTags, idsAndTags, setIdsAndTags} = useContext(AllTagsContext);
    const [searching, setSearching] = useState(false);
    const [searchIds, setSearchIds] = useState([]);

    useEffect(() => {
        if(!searching) {
            setSearchIds([])
        }
    }, [searching])

    return(
        <SearchTweetIdsContext.Provider value={{searching, setSearching, searchIds, setSearchIds}}>
            {props.children}
        </SearchTweetIdsContext.Provider>
    )
}