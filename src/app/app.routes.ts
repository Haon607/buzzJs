import { Routes } from '@angular/router';
import { JoinGameComponent } from './components/join-game/join-game.component';
import { CategoryComponent } from "./components/category/category.component";
import { PunktesammlerRoundComponent } from "./components/rounds/multiple-choice/punktesammler.round/punktesammler.round.component";
import { Round } from "./services/memory.service";
import { StopTheClockRoundComponent } from "./components/rounds/multiple-choice/stop-the-clock.round/stop-the-clock.round.component";
import { WhatisthequestionRoundComponent } from "./components/rounds/open-ended/whatisthequestion.round/whatisthequestion.round.component";

export const routes: Routes = [
  {path: "", component: JoinGameComponent},
  {path: "category/:bgc", component: CategoryComponent},
  {path: "round"+Round.punktesammler.path, component: PunktesammlerRoundComponent},
  {path: "round"+Round.stopTheClock.path, component: StopTheClockRoundComponent},
  {path: "round"+Round.whatIsTheQuestion.path, component: WhatisthequestionRoundComponent},
];
