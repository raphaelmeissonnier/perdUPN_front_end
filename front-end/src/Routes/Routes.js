import React from "react";
import { Switch, Route } from "react-router-dom";

import App from "../App";
import AjoutObjetTrouve from '../Components/AjoutObjetTrouve';
import ChercherObjetPerdu from "../Components/ChercherObjetPerdu";
import AjoutObjetPerdu from '../Components/AjoutObjetPerdu';
import ObjetsMatche from '../Components/ObjetsMatche';

const Routes = () =>{
    return(
        <div>
            <Switch>
                <Route exact path="/" component={App} />
                <Route exact path="/AjoutObjetTrouve" component={AjoutObjetTrouve} />
                <Route exact path="/ChercherObjetPerdu" component={ChercherObjetPerdu} />
                <Route exact path="/AjoutObjetPerdu" component={AjoutObjetPerdu} />
                <Route exact path="/ObjetsMatche" component={ObjetsMatche} />
            </Switch>
        </div>
    )
}


export default Routes;
