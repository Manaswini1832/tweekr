import { useState, useContext } from "react";
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import Modal from "../Modal/Modal";
import axios from "axios";

import "./SideBar.scss";

import {AuthContext} from "../../contexts/AuthContext/AuthContext";
import { CollecNamesContext } from "../../contexts/CollecNamesContext/CollecNamesContext";
import { CurrCollContext } from "../../contexts/CurrCollContext/CurrCollContext";
import {ThemeContext} from "../../contexts/ThemeContext/ThemeContext";

const SideBar = (props) => {
    const {auth, setAuth} = useContext(AuthContext);
    const {collecNames, setCollecNames} = useContext(CollecNamesContext);
    const {currColl, setCurrColl} = useContext(CurrCollContext);
    const {theme, setTheme, changeTheme} = useContext(ThemeContext);

    const [modalOpen, setModalOpen] = useState(false);
    const [newCollec, setNewCollec] = useState(null);

    function changeCurrColl(e){
        const collection_id = e.target.getAttribute("data-collectionid");
        const collection_name = e.target.innerText;

        //No need to make database requests again and again if the user is clicking on same collection again and again
        if(collection_name !== currColl[0].collection_name){
            setCurrColl([{
                collection_id,
                collection_name
            }])
        }
    }

        function handleNewCollecChange(e){
        setNewCollec(e.target.value);
    }

    async function createCollection(e){
        e.preventDefault();
        if(newCollec && newCollec !== ""){
            if(newCollec === "Uncategorized"){
                alert("A collection with this name can't be created!")
            }else{
                //Make request to API to create a new collection
            await axios.post("/api/v1/collections", {
                collectionInfo : {
                    collection_name : newCollec,
                    user_id : auth.uid,
                }
            })
            .then((res) => {
                if(res.data.message === "Success! Collection created successfully!"){
                    setCollecNames((prev) => {
                        return[...prev, ...res.data.payload]
                    });
                    setModalOpen(false);
                    setCurrColl(res.data.payload);
                }else{
                    alert(res.data.message);
                }
            })
            .catch((err) => {
                alert("Error creating collection! Please try again!")
            })
            }
        }else if(newCollec === ""){
            alert("Please enter a collection name");
        }else if(!newCollec){
            alert("Please enter a collection name");
        }
    }

    return(
        <div className={props.sidebar_toggle_btn ? "show_sidebar" : "hide_sidebar"}>
        <nav className={theme === 'light' ? "common_sidebar light_sidebar" : "common_sidebar dark_sidebar"}>
            <button className="sidebar_close_sidebar_btn" onClick={() => props.set_sidebar_toggle(false)}>
                <CloseRoundedIcon/>
            </button>
            <ul className="sidebar_list">
                {collecNames.map((collec, index) => {
                        return(
                            <div key={index}>
                                <li 
                                // className="sidebar_list_item"
                                className={
                                    currColl[0].collection_name === collec.collection_name
                                    ? "sidebar_list_item sidebar_list_border_put"
                                    : "sidebar_list_item sidebar_list_border_remove"
                                }
                                onClick={changeCurrColl} data-collectionid={collec.collection_id}>
                                    {collec.collection_name}
                                    
                                </li>
                                {collec.collection_name === "Uncategorized"
                                    ? null
                                    : <div className="sidebar_list_icons">
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
                                                  <button className="new_collec_btn" onClick={() => setModalOpen(true)}>New Collection</button>

            </ul>
                  <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                  <form onSubmit={createCollection}>
                        <label>Enter a new collection name</label>
                        <input onChange={handleNewCollecChange} type="text"/>
                        <div className="button-div">
                            <button type="submit">Create</button>
                            <button onClick={() => setModalOpen(false)}>Cancel</button>
                        </div>
                   </form>
                  </Modal>
        </nav>
        </div>
    )
}

export default SideBar;