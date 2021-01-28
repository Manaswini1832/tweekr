import { useEffect, useContext } from "react";
import axios from "axios";
import { BaseContext } from "../../contexts/BaseContext/BaseContext";

const Login = () => {
    const firebase = useContext(BaseContext);

    useEffect(() => {
        createTokens();
    }, []);

    async function createTokens() {
        await axios.get("/api/v1");
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
            <h1>Login page</h1>
            <button onClick={signUserIn}>Login with Twitter</button>
        </div>
    )
}

export default Login;