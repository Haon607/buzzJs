import { Routes } from '@angular/router';
import { JoinGameComponent } from './components/join-game/join-game.component';
import { CategoryComponent } from "./components/category/category.component";

export const routes: Routes = [
  {path: "", component: JoinGameComponent},
  {path: "category/:bgc", component: CategoryComponent}
];
