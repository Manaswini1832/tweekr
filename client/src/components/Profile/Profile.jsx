/*global chrome*/
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";

import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { BaseContext } from "../../contexts/BaseContext/BaseContext";
import { CollecNamesContext } from "../../contexts/CollecNamesContext/CollecNamesContext";
import { CurrCollContext } from "../../contexts/CurrCollContext/CurrCollContext";

import SideBar from "../SideBar/SideBar";
import TweeksContainer from "../TweeksContainer/TweeksContainer";
import Modal from "../Modal/Modal";
import { set } from "js-cookie";


const Profile = () => {

    // const [show, setShow] = useState(true);
    const [collecNameBeforeEdit, setCollecNameBeforeEdit] = useState(null);
    const [collecNameAfterEdit, setCollecNameAfterEdit] = useState(null);
    const [showEditCollecModal, setShowEditCollecModal] = useState(false);
    const [showDeleteCollecModal, setShowDeleteCollecModal] = useState(false);
    const [collecIDToEdit, setCollecIDToEdit] = useState(null); //collection_id of collection to be edited
    const [url, setUrl] = useState("");
    const [collecIDToDelete, setCollecIDToDelete] = useState(null);
    const [showTweekAddForm, setShowTweekAddForm] = useState(false);
    const [addTweek, setAddTweek] = useState(false);
    const [twID, setTwID] = useState(null);
    const {auth, setAuth} = useContext(AuthContext);
    const {collecNames, setCollecNames} = useContext(CollecNamesContext);
    const {currColl, setCurrColl} = useContext(CurrCollContext);
    const firebase = useContext(BaseContext);
    const db = firebase.db

    const [showLoader, setShowLoader] = useState(true);
    const [showUnauth, setShowUnauth] = useState(false);

    useEffect(() => {
        validateUserEntry();
    }, []);

    useEffect(() => {
        const extID = 'aineoagmcghnilahgnnmimnjdanfddif';
        if(auth){
            if(auth.uid){
            chrome.runtime.sendMessage(extID, {
                message : "Message from the web app",
                uid : auth.uid
         })}
        }
        // console.log('Auth changed')
        // console.log(auth)
    }, [auth]);

    useEffect(() => {
        if(currColl[0].collection_name !== "Uncategorized"){
            setShowTweekAddForm(true)
        }else{
            setShowTweekAddForm(false)
        }

    }, [currColl]);


    async function validateUserEntry(){
        await axios.get("/api/v1/validateEntry")
        .then((res) => {
            if(res.data.message === "Success. Redirect now"){
                setAuth(res.data.details);
                setShowLoader(false);
            }else if(res.data.message === "Failed. Don't redirect"){
                setShowUnauth(true);
            }
        })
    }

    async function signUserOut(e){
        e.preventDefault();
        await 
        axios.get("/api/v1/signOut")
        .then((res) => {
            if(res.data === "Redirect back to login"){
                setShowLoader(false);
                setShowUnauth(true);
            }
        })
        .then(() => {
            //make the authContext null
            setAuth(null);
        })
        .catch((err) => {
            console.error("Couldn't sign you out! Please try again");
        })
    }

    function editCollec(collecName, collecID){
        setCollecNameBeforeEdit(collecName);
        setCollecNameAfterEdit(collecName);
        setShowEditCollecModal(true);
        setCollecIDToEdit(collecID);
    }

    async function editCollecInDBAndApp(e){
        e.preventDefault();
        setShowEditCollecModal(false);

        //Check if edited name is same as already present one or not
        //If yes, don't make a database request
        //Else make the request

        if(!(collecNameBeforeEdit.toLowerCase() === collecNameAfterEdit.toLowerCase())){
            await axios.put(`/api/v1/collections/${collecIDToEdit}`, {
                collectionInfo : {
                    collection_name : collecNameAfterEdit,
                }
            })
            .then((res) => {
                if(res.data.message === "Success! Successfully modified collection :)"){
                    //Following chunk of code updates collection names context with edited collection name
                    const elementsIndex = collecNames.findIndex(element => element.collection_id === collecIDToEdit)
                    let newArray = [...collecNames];
                    newArray[elementsIndex] = {
                        collection_id : collecIDToEdit,
                        collection_name : collecNameAfterEdit
                    }
                    setCollecNames(newArray);
                    if(currColl[0].collection_name === collecNameBeforeEdit){
                        setCurrColl([{
                            collection_id: collecIDToEdit,
                            collection_name : collecNameAfterEdit
                        }])
                    } 
                }else{
                    alert("Couldn't update collection. Please try again!");
                }
            })
        }
    }

    async function deleteCollectionFromDBAndApp(e){
        e.preventDefault();
        setShowDeleteCollecModal(false);

        await axios.delete(`/api/v1/collections/${collecIDToDelete}`)
        .then((res) => {
            if(res.data.message === "Successfully deleted collection :)"){
                const filteredCollecs = collecNames.filter((item) => item.collection_id !== collecIDToDelete);
                setCollecNames(filteredCollecs);
                //This makes sure, while deleting, if currColl=collecToBeDeleted, 
                //After deletion, currColl automatically changes to Uncategorized
                if(currColl[0].collection_id ===collecIDToDelete){
                    setCurrColl([{
                        collection_id : "0",
                        collection_name : "Uncategorized"
                    }])
                }
            }else{
                alert("Couldn't delete collection. Please try again!")
            }
        })
    }

    function makeTweek(e){
        e.preventDefault();
        if(url !== ""){
            try{
                const tweetIDRegex = /(?<=status\/)\d+/;
                const enteredId = url.match(tweetIDRegex)[0];
                const collectionID = currColl[0].collection_id;
                //Add tweet id to postgres
                addTweetId(enteredId, collectionID);
                // setTweetIds((prevIds) => {
                //     return [...prevIds, enteredId];
                // });
                setUrl("");
            }
            catch(err){
                console.error(err);
            }
        }
    }

    async function addTweetId(enteredID, collectionID){
        await axios.post('/api/v1/createTweek', {
            tweek_info: {
                tweet_id : enteredID, 
                user_id: auth.uid,
                collection_id : collectionID
            }
        })
        .then((res) => {
            if(res.data.message === 'Successfully created tweek!'){
                setAddTweek(true)
                setTwID(enteredID)
            }
        })
    }    

    return(
        <div>
        {
            showLoader
            ? <h1>Loading .....</h1>
            : <div>
            <h1>Hello {auth.name}</h1>
            <button onClick={signUserOut}>Sign out</button>
            <a href="https://twitter.com/home"><button>Go to Twitter</button></a>
            <h1>{currColl[0].collection_name}</h1>
            <SideBar editCollec={editCollec} setShowDeleteCollecModal={setShowDeleteCollecModal} setCollecIDToDelete={setCollecIDToDelete}/>
            {
                showTweekAddForm
                ?  <form onSubmit={makeTweek}>
                    <label>Paste tweet URL</label>
                    <input onChange={e => setUrl(e.target.value)} type="text" value={url}/>
                    <button type="submit">Add</button>
            </form>
                : null
            }
            <TweeksContainer addTweek={addTweek} twID={twID}/>
            
            <Modal open={showEditCollecModal} onClose={() => setShowEditCollecModal(false)}>
                <form>
                    <label>Type in your new collection name :</label>
                    <input onChange={(e) => setCollecNameAfterEdit(e.target.value)} type="text" value={collecNameAfterEdit}/>
                    <button onClick={editCollecInDBAndApp}>Edit</button>
                    <button onClick={() => setShowEditCollecModal(false)}>Cancel</button>
                </form>
            </Modal>
            <Modal open={showDeleteCollecModal} onClose={() => setShowDeleteCollecModal(false)}>
                <form>
                    <label>Are you sure you want to delete this collection? You will lose all the tweeks you stored in it</label>
                    <button onClick={deleteCollectionFromDBAndApp}>Delete</button>
                    <button onClick={() => setShowDeleteCollecModal(false)}>Cancel</button>
                </form>
            </Modal>
        </div>
        }
        {
        showUnauth
        ? <Redirect to="/login" />
        : null
        }            
        </div>
    )
}

export default Profile;
