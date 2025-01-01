import { Routes } from '@angular/router';
import { JoinGameComponent } from './components/join-game/join-game.component';
import { CategoryComponent } from "./components/category/category.component";
import { PunktesammlerRoundComponent } from "./components/rounds/punktesammler.round/punktesammler.round.component";
import { Round } from "./services/memory.service";

export const routes: Routes = [
  {path: "", component: JoinGameComponent},
  {path: "category/:bgc", component: CategoryComponent},
  {path: "round"+Round.Punktesammler.path, component: PunktesammlerRoundComponent}
];
