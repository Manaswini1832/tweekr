import { useState, useEffect, useContext } from "react";
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import red from "@material-ui/core/colors/red";
import Modal from "../Modal/Modal";

import "./SideBar.css";

import { CollecNamesContext } from "../../contexts/CollecNamesContext/CollecNamesContext";
import { CurrCollContext } from "../../contexts/CurrCollContext/CurrCollContext";

const SideBar = (props) => {
    const {collecNames, setCollecNames} = useContext(CollecNamesContext);
    const {currColl, setCurrColl} = useContext(CurrCollContext);

    function changeCurrColl(e){
        const collection_id = e.target.getAttribute("data-collectionid");
        const collection_name = e.target.innerText;
        setCurrColl([{
            collection_id,
            collection_name
        }]);
        //When currColl changes here, the useEffect in TweeksContainer will be triggered and resp tweeks will be
        //fetched from PG DB
    }

    return(
        <nav>
            <ul>
                {collecNames.map((collec, index) => {
                        return(
                            <div key={index}>
                                <li onClick={changeCurrColl} data-collectionid={collec.collection_id} className="collecListItem">{collec.collection_name}</li>
                                {
                                    collec.collection_name === "Uncategorized"
                                    ? null
                                    : <div>
                                       <EditIcon onClick={() => props.editCollec(collec.collection_name, collec.collection_id)} style={{ color: "red" }}  />
                                       <DeleteIcon onClick={() => {
                                           props.setShowDeleteCollecModal(true);
                                           props.setCollecIDToDelete(collec.collection_id);
                                    }}/> 
                                    </div>
                                }
                            </div>
                        )
                })}
            </ul>
        </nav>
    )
}

export default SideBar;