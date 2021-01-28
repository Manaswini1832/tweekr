/*global chrome*/
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";

const Profile = () => {

    const [show, setShow] = useState(true);
    const {auth, setAuth} = useContext(AuthContext);

    useEffect(() => {
            if(show) {
            const extID = "kpfgbnjlhgifomfppacjmlapdkbjineo";
            chrome.runtime.sendMessage(extID, {
                message : "Message from the web app",
                uid : auth.uid
            })
        }
    }, []);

    async function signUserOut(e){
        e.preventDefault();
        await 
        axios.get("/api/v1/signOut")
        .then((res) => {
            if(res.data === "Redirect back to login"){
                setShow(false);
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

    return(
        <div>
            {
            show
            ?   <div><h1>Hello {auth.name}</h1>
                <button onClick={signUserOut}>Sign out</button>
                <a href="https://twitter.com/home"><button>Go to Twitter</button></a>
                </div>
            :   <div>
                    You're not logged in.
                    <Link to="/login"><button>Go back to login page</button></Link>
                </div>
            }
        </div>
    )
}

export default Profile;