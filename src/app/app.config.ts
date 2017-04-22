import {Ng2StateDeclaration} from "ui-router-ng2";
import {HomeComponent} from "./home/home.component";

export let MAIN_STATES: Ng2StateDeclaration[] = [
  {
    name: 'home', url: '/home',
    params: {modal: ''},
    component: HomeComponent
  }
];
