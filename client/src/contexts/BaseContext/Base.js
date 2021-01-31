import app from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import Cookies from "js-cookie";

const devConfig = {
    apiKey: "AIzaSyBEDA2cJZJvCS6rRhnHqgitFCZj2MiDGao",
    authDomain: "server-auth-51141.firebaseapp.com",
    projectId: "server-auth-51141",
    storageBucket: "server-auth-51141.appspot.com",
    messagingSenderId: "20867979546",
    appId: "1:20867979546:web:17149a40548c5b0a39f4a3"
};

class Firebase {
    constructor(){
        this.app = app.initializeApp(devConfig);
        this.db = app.firestore();
    }
    doSignIn = async() => {
            const provider = new app.auth.TwitterAuthProvider();
            await 
            app.auth().signInWithPopup(provider)
            .then(({ user }) => {
                return user.getIdToken().then((idToken) => {
                  return fetch("/api/v1/sessionLogin", {
                    method: "POST",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                      "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                    },
                    body: JSON.stringify({ idToken }),
                  });
                });
              })
              .then(() => {
                return app.auth().signOut();
              })
              .then(() => {
                window.location.assign("/profile");
              })
              return false;
    }
}

export default Firebase;