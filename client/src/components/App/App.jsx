import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Login from "../Login/Login";
import Profile from "../Profile/Profile";
import My404Component from "../My404Component/My404Component";

import PrivateRoute from "../../PrivateRoute";

const App = () => {
    return(
            <Router>
                <Switch>
                    <Route path="/" exact component={Login}/>
                    <PrivateRoute path="/profile" exact component={Profile}/>
                    <Route path='*' component={My404Component} />
                </Switch>
            </Router>
    )
}

export default App;