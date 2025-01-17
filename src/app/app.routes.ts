import { Routes } from '@angular/router';
import { JoinGameComponent } from './components/join-game/join-game.component';
import { CategoryComponent } from "./components/category/category.component";
import { PunktesammlerRoundComponent } from "./components/rounds/multiple-choice/punktesammler.round/punktesammler.round.component";
import { Round } from "./services/memory.service";
import { StopTheClockRoundComponent } from "./components/rounds/multiple-choice/stop-the-clock.round/stop-the-clock.round.component";
import { WhatisthequestionRoundComponent } from "./components/rounds/open-ended/whatisthequestion.round/whatisthequestion.round.component";
import { SpotlightRoundComponent } from "./components/rounds/open-ended/spotlight.round/spotlight.round.component";
import { FastestRoundComponent } from "./components/rounds/open-ended/fastest.round/fastest.round.component";
import { MusicboxRoundComponent } from "./components/rounds/open-ended/musicbox.round/musicbox.round.component";
import { SkippingRoundComponent } from "./components/rounds/open-ended/skipping.round/skipping.round.component";
import { TimelineRoundComponent } from "./components/rounds/timeline.round/timeline.round.component";

export const routes: Routes = [
  {path: "", component: JoinGameComponent},
  {path: "category/:bgc", component: CategoryComponent},
  {path: "round"+Round.punktesammler.path, component: PunktesammlerRoundComponent},
  {path: "round"+Round.stopTheClock.path, component: StopTheClockRoundComponent},
  {path: "round"+Round.whatIsTheQuestion.path, component: WhatisthequestionRoundComponent},
  {path: "round"+Round.spotlight.path, component: SpotlightRoundComponent},
  {path: "round"+Round.fastestFinger.path, component: FastestRoundComponent},
  {path: "round"+Round.musicBox.path, component: MusicboxRoundComponent},
  {path: "round"+Round.skipping.path, component: SkippingRoundComponent},
  {path: "round"+Round.timeline.path, component: TimelineRoundComponent},
];
