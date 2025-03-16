import { EventEmitter, Injectable } from '@angular/core';
import { Style, styledLogger } from '../../utils';
import { Category, CategoryLoader } from "../../Loader";
import { Player } from "../../models";
import { Round, RoundInterface } from "./round";

@Injectable({
    providedIn: 'root'
})
export class MemoryService {
    rounds: RoundInterface[] = [];
    roundNumber = 0;
    players: Player[] = [];
    category: Category | null = null;
    scoreboardKill: EventEmitter<void> = new EventEmitter<void>();
    crossMusic: HTMLAudioElement = new Audio();
    // pointsPerRound: number = 100;
    // pointsPerRoundIncrement: number = 25;

    constructor() {
        this.rounds = [
            Round.textAware,
            Round.punktesammler,
            // Round.washingMachine,
            // Round.drawing,
            // Round.wonderWall,
            // Round.iLiterallyJustToldYou,
            Round.streak,
            Round.timeline,
            Round.waitForIt,
            Round.whatIsTheQuestion,
            Round.spotlight,
            Round.skipping,
            Round.musicBox,
            Round.stopTheClock,
            // Round.shortFuse,
            // Round.stealing,
            Round.fastestFinger,
        ];
        this.roundNumber = 0;
        // this.pointsPerRound = 100;
        // this.pointsPerRoundIncrement = 25;
        this.players = [
            {
                name: "Name",
                controllerId: 0,
                gameScore: 11,
            }, {
                name: "Benedikt",
                controllerId: 1,
                gameScore: 10,
            }, {
                name: "Waltraud",
                controllerId: 2,
                gameScore: 0,
            }, {
                name: "Moritz",
                controllerId: 3,
                gameScore: -10,
            },
        ]
        this.category = CategoryLoader.inDiesemJahr;
    }

    print() {
        styledLogger("Printing Memory", Style.highlightInformation)
        styledLogger("Rounds:" + this.rounds.map(round => " " + round.name), Style.information)
        styledLogger("Round number: " + this.roundNumber, Style.information)
        // styledLogger("Points per Round: " + this.pointsPerRound, Style.information)
        // styledLogger("Points per Round increment: " + this.pointsPerRoundIncrement, Style.information)
        // styledLogger("Points at stake this Round: " + this.calculatePointsPerOpportunity(1), Style.information)
        styledLogger("Category: " + this.category?.name, Style.information)
        styledLogger("Players:" + this.players.map(player => " " + player.controllerId + " " + player.name + " " + player.gameScore), Style.information)
    }

    // calculatePointsPerOpportunity(opportunities: number) {
    //     return Math.floor((this.pointsPerRound + (this.pointsPerRoundIncrement * this.roundNumber)) / opportunities)
    // }
}
