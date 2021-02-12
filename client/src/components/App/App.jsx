import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "../Home/Home";
import Login from "../Login/Login";
import Profile from "../Profile/Profile";
import My404Component from "../My404Component/My404Component";

const App = () => {
    return(
            <Router>
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/login" exact component={Login}/>
                    <Route path="/profile" exact component={Profile}/>
                    <Route path='*' component={My404Component} />
                </Switch>
            </Router>
    )
}

export default App;