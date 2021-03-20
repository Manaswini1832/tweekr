import React, { useState, useEffect } from "react";

//Stores the collection id of the current collection
export const ThemeContext = React.createContext(null);

export const ThemeContextProvider = (props) => {

    //Can be light or dark
    const [theme, setTheme] = useState("dark");

   const changeTheme = () => {
       if(theme === "light"){
           setTheme("dark");
           localStorage.setItem('theme', 'dark');
       }else{
           setTheme("light");
           localStorage.setItem('theme', 'light');
       }
   }  

   useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme) {
        setTheme(savedTheme);
    }
   }, []);

    return(
        <ThemeContext.Provider value={{theme, setTheme, changeTheme}}>
            {props.children}
        </ThemeContext.Provider>
    )
}