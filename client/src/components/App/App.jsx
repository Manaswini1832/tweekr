import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "../Home/Home";
import Login from "../Login/Login";
import Profile from "../Profile/Profile";
import SomeComp from "../SomeComp/SomeComp";
import My404Component from "../My404Component/My404Component";

import PrivateRoute from "../../PrivateRoute";

const App = () => {
    return(
            <Router>
                <Switch>
                    <Route path="/" exact component={Home}/>
                    <Route path="/login" exact component={Login}/>
                    <PrivateRoute path="/profile" exact component={Profile}/>
                    <PrivateRoute path="/private" exact component={SomeComp}/>
                    <Route path='*' component={My404Component} />
                </Switch>
            </Router>
    )
}

export default App;