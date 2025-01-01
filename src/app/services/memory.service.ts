import { Injectable } from '@angular/core';
import { Style, styledLogger } from '../../utils';
import { QuestionType } from "../../Loader";
import { Player } from "../../models";

@Injectable({
    providedIn: 'root'
})
export class MemoryService {
    rounds: RoundInterface[] = [];
    roundNumber: number = 0;
    players: Player[] = [];

    constructor() {
        this.rounds = [
            Round.Punktesammler,
            Round.StopTheClock,
        ];
        this.roundNumber = 0;
        this.players = [
            {
                name: "Name",
                controllerId: 0,
                gameScore: 0,
            },{
                name: "Benedikt",
                controllerId: 1,
                gameScore: 0,
            },{
                name: "Waltraud",
                controllerId: 2,
                gameScore: 0,
            },{
                name: "Moritz",
                controllerId: 3,
                gameScore: 0,
            },
        ]
    }

    print() {
        styledLogger("Printing Memory", Style.information)
        styledLogger("Rounds: " + this.rounds.map(round => round.name), Style.information)
        styledLogger("Round number: " + this.roundNumber, Style.information)
    }
}

export class Round {
    static Punktesammler: RoundInterface = {
        name: "Punktesammler",
        category: true,
        questionType: QuestionType.multipleChoice,
        path: "/punktesammler",
        iconPath: "m260-520 220-360 220 360H260ZM700-80q-75 0-127.5-52.5T520-260q0-75 52.5-127.5T700-440q75 0 127.5 52.5T880-260q0 75-52.5 127.5T700-80Zm-580-20v-320h320v320H120Zm580-60q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-500-20h160v-160H200v160Zm202-420h156l-78-126-78 126Zm78 0ZM360-340Zm340 80Z",
        background: "#015c53",
        primary: "#20fff8",
        secondary: "#015c53"
    };
    static StopTheClock: RoundInterface = {
        name: "Stoppe die Zeit!",
        category: true,
        questionType: QuestionType.multipleChoice,
        path: "/stoptheclock",
        iconPath: "",
        background: "#5c0147",
        primary: "#e120ff",
        secondary: "#9e1180"
    };
    // Liederbeginn Buzzing
    // Lieder autism highlight multiselect
    // Stop the clock
    // I literally just told you
}

export interface RoundInterface {
    name: string;
    questionType: QuestionType;
    category: boolean;
    path: string;
    iconPath: string;
    background: string;
    primary: string;
    secondary: string;
}
