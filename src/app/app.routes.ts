import { Routes } from '@angular/router';
import { JoinGameComponent } from './components/join-game/join-game.component';
import { CategoryComponent } from "./components/categorys/category/category.component";
import { PunktesammlerRoundComponent } from "./components/rounds/multiple-choice/punktesammler.round/punktesammler.round.component";
import { StopTheClockRoundComponent } from "./components/rounds/multiple-choice/stop-the-clock.round/stop-the-clock.round.component";
import { WhatisthequestionRoundComponent } from "./components/rounds/open-ended/whatisthequestion.round/whatisthequestion.round.component";
import { SpotlightRoundComponent } from "./components/rounds/open-ended/spotlight.round/spotlight.round.component";
import { FastestRoundComponent } from "./components/rounds/open-ended/fastest.round/fastest.round.component";
import { MusicboxRoundComponent } from "./components/rounds/open-ended/musicbox.round/musicbox.round.component";
import { SkippingRoundComponent } from "./components/rounds/open-ended/skipping.round/skipping.round.component";
import { TimelineRoundComponent } from "./components/rounds/timeline.round/timeline.round.component";
import { WaitForItRoundComponent } from "./components/rounds/multiple-choice/wait-for-it.round/wait-for-it.round.component";
import { StealingRoundComponent } from "./components/rounds/open-ended/stealing.round/stealing.round.component";
import { DrawingRoundComponent } from "./components/rounds/drawing.round/drawing.round.component";
import { WashingMachineRoundComponent } from "./components/rounds/multiple-choice/washing-machine.round/washing-machine.round.component";
import { TextAwareComponent } from "./components/rounds/text-aware/text-aware.component";
import { StreakRoundComponent } from "./components/rounds/streak.round/streak.round.component";
import { Round } from "./services/round";
import { FinalCategoryComponent } from "./components/categorys/final-category/final-category.component";
import { LastQuestionsRoundComponent } from "./components/rounds/finals/last-questions.round/last-questions.round.component";
import { FinalScoreboardComponent } from "./final-scoreboard/final-scoreboard.component";

export const routes: Routes = [
    {path: "", component: JoinGameComponent},
    {path: "category/:bgc", component: CategoryComponent},
    {path: "final/:bgc", component: FinalCategoryComponent},
    {path: "scoreboard/final/:bgc", component: FinalScoreboardComponent},
    {path: "round" + Round.punktesammler.path, component: PunktesammlerRoundComponent},
    {path: "round" + Round.waitForIt.path, component: WaitForItRoundComponent},
    {path: "round" + Round.stopTheClock.path, component: StopTheClockRoundComponent},
    {path: "round" + Round.whatIsTheQuestion.path, component: WhatisthequestionRoundComponent},
    {path: "round" + Round.spotlight.path, component: SpotlightRoundComponent},
    {path: "round" + Round.fastestFinger.path, component: FastestRoundComponent},
    {path: "round" + Round.stealing.path, component: StealingRoundComponent},
    {path: "round" + Round.streak.path, component: StreakRoundComponent},
    {path: "round" + Round.musicBox.path, component: MusicboxRoundComponent},
    {path: "round" + Round.skipping.path, component: SkippingRoundComponent},
    {path: "round" + Round.textAware.path, component: TextAwareComponent},
    {path: "round" + Round.timeline.path, component: TimelineRoundComponent},
    {path: "round" + Round.drawing.path, component: DrawingRoundComponent},
    {path: "round" + Round.washingMachine.path, component: WashingMachineRoundComponent},
    {path: "round" + Round.final10.path, component: LastQuestionsRoundComponent},
];
