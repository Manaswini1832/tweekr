import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
import { BaseContext } from "../../contexts/BaseContext/BaseContext";

const Login = () => {
    const firebase = useContext(BaseContext);
    const [redirectToProfile, setRedirectToProfile] = useState(false);

    useEffect(() => {
        createTokens();
        checkSessionCookie();
    }, []);

    async function createTokens() {
        await axios.get("/api/v1");
    }

    async function checkSessionCookie(){
        await axios.get("/api/v1/validateEntry")
        .then((res) => {
            if(res.data.message === "Success. Redirect now"){
                setRedirectToProfile(true);
            }else if(res.data.message === "Failed. Don't redirect"){
                setRedirectToProfile(false);
            }
        })
    }

    async function signUserIn(e){
        e.preventDefault();
        try{
            await 
            firebase.doSignIn();
        }
        catch(err){
            throw err;
        }
    }

    return(
        <div>
           {
            redirectToProfile
            ? <Redirect to="/profile"/>
            : <div>
                <h1>Login page</h1>
                <button onClick={signUserIn}>Login with Twitter</button>
            </div>
            }
        </div>
    )
}

export default Login;