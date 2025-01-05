import { shuffleArray } from './utils';
import { Genre, MusicQuestion } from "./MusicLoader";

export interface Question {
    question: string;
    answers: Answer[];
    shuffle: boolean;
}

export enum QuestionType {
    multipleChoice,
    openEnded,
    music,
}

export interface Answer {
    answer: string;
    correct: boolean;
}

export interface Category {
    name: string;
    questionType: QuestionType;
    musicFilterStatement?: (music: MusicQuestion) => boolean;
}

export class QuestionLoader {
    public static loadQuestion(category: Category): Question[] {
        let questions: Question[] = [];

        switch (category.name) {
            case CategoryLoader.menschlicherKoerper.name:
                questions.push({
                    question: "Welcher dieser menschlichen Knochen hat keine dreieckige Form?",
                    answers: [{answer: "Steißbein", correct: false}, {answer: "Kreuzbein", correct: false}, {answer: "Kniescheibe", correct: false}, {answer: "Elle", correct: true}],
                    shuffle: true,
                });
                questions.push({
                    question: "Die Osteologie ist die Lehre von...",
                    answers: [{answer: "Knochen und Knochenkrankheiten", correct: true}, {answer: "Schmerzen und Schmerzenslinderung", correct: false}, {answer: "Kräuter und Heilkräuter", correct: false}, {answer: "Trauma und Traumatherapie", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: "Wo haben Menschen keine Muskeln?",
                    answers: [{answer: "In den Fingern", correct: true}, {answer: "In den Ohren", correct: false}, {answer: "In der Nase", correct: false}, {answer: "In den Oberschenkeln", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: "Im Ohr ist ein kleines Organ welches für welchen Sinn verantwortlich ist?",
                    answers: [{answer: "In den Fingern", correct: true}, {answer: "In den Ohren", correct: false}, {answer: "In der Nase", correct: false}, {answer: "In den Oberschenkeln", correct: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.videogames.name:
                questions.push({
                    question: 'Aus wie vielen Quadraten bestehen alle "Tetris"-Blöcke?',
                    answers: [{answer: "Drei", correct: false}, {answer: "Vier", correct: true}, {answer: "Fünf", correct: false}, {answer: "Sechs", correct: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'In welchem 2023 erschienen Horrorspiel ist das Ziel, möglichst viele Gegenstände aus einem verlassenen Gebäude zu holen.',
                    answers: [{answer: "Lethal Company", correct: true}, {answer: "Phasmophobia", correct: false}, {answer: "Among Us", correct: false}, {answer: "Content Warning", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Der Protagonist Solid Snake stammt aus welcher Videospielserie?',
                    answers: [{answer: "Metal Gear", correct: true}, {answer: "Ultimate Chicken Horse", correct: false}, {answer: "Scrap Mechanic", correct: false}, {answer: "Assassin's Creed", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Das erste Videospiel Pong wurde in welchem Jahr veröffentlicht?',
                    answers: [{answer: "1961", correct: false}, {answer: "1972", correct: true}, {answer: "1983", correct: false}, {answer: "1994", correct: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie viele Runden pro Rennen fährt man im klassischen Super Mario Kart für das SNES?',
                    answers: [{answer: "1", correct: false}, {answer: "3", correct: false}, {answer: "5", correct: true}, {answer: "7", correct: false}],
                    shuffle: false,
                });
                questions.push({
                    question: '',
                    answers: [{answer: "Rollercoaster Tycoon", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: '',
                    answers: [{answer: "Kingdom Hearts", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wie heißt die erfolgreiche Globalstrategie-Computerspielreihe die von "Sid Meier" entwickelt wurde und 2025 den 7. Ableger bekommt?',
                    answers: [{answer: "Civilization", correct: true}, {answer: "Rollercoaster Tycoon", correct: false}, {answer: "Monster Hunter", correct: false}, {answer: "X-COM", correct: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.traditionen.name:
                questions.push({
                    question: 'In welche Monate kann das Chinesische Neujahrsfest fallen?',
                    answers: [{answer: "Dezember oder Jänner", correct: false}, {answer: "Jänner oder Februar", correct: true}, {answer: "Februar oder März", correct: false}, {answer: "März oder April", correct: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Während bei uns am 26. Dezember Stefanitag ist, heißt der Feiertag in Großbritannien...',
                    answers: [{answer: "Boxing Day", correct: true}, {answer: "Playing Day", correct: false}, {answer: "Sprinting Day", correct: false}, {answer: "Drinking Day", correct: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.filmeUndSerien.name:
                questions.push({
                    question: 'Wie heißt das Stammcafé von Rachel, Phoebe, Monica, Joey, Ross und Chandler in dem US-Serienklassiker Friends',
                    answers: [{answer: "Central Perk", correct: true}, {answer: "Rock à Fella", correct: false}, {answer: "Mainhatten", correct: false}, {answer: "Coffeens", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welches Studio produziert günstige, profitable Horrorfilme wie "Paranormal Activity" und "The Purge"?',
                    answers: [{answer: "Blumhouse Productions", correct: true}, {answer: "Studio Babelsberg", correct: false}, {answer: "Screen Gems", correct: false}, {answer: "Fine Line Features", correct: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.literatur.name:
                questions.push({
                    question: '"Nennt mich Ismael", so beginnt der berühmte Roman...',
                    answers: [{answer: "Moby Dick", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.gadgetsAndGizmos.name:
                questions.push({
                    question: 'Welche Sprache spricht ein Furby?',
                    answers: [{answer: "Furbish", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Für was steht die Abkürzung GPS?',
                    answers: [{answer: "Global Positioning System", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false}],
                    shuffle: true,
                });
                break;


            case CategoryLoader.phobien.name:
                questions.push({
                    question: "Vor welchen Brummern hat eine Person mit Apiphobie angst?",
                    answers: [{answer: "bienenartige Insekten", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: "Mit Cherophobie muss man ziemlich unglücklich Leben, denn diese Beschreibt die Angst vor...",
                    answers: [{answer: "Glücklichsein", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Die durch Soziale Netzwerke populär gewordene "FOMO" beschreibt welche Angst?',
                    answers: [{answer: "FEAR OF MISSING OUT", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie nennt man die Angst vor engen Räumen?',
                    answers: [{answer: "Klaustrophobie", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie nennt man umgangssprachlich die Akrophobie, die beim Betreten von Hochhäusern, Brücken oder Aussichtstürmen auftreten kann?',
                    answers: [{answer: "Höhenangst", correct: true}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.werBinIch.name:
                questions.push({
                    question: '',
                    answers: [{answer: "Neo (Matrix", correct: true}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.sehenswuerdigkeiten.name:
                questions.push({
                    question: 'In welchem Land liegt die längste Mauer der Welt?',
                    answers: [{answer: "China", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Mit 330 Metern höhe steht welches Bauwerk im 7. Arrondissement der viertgrößten Stadt Europas?',
                    answers: [{answer: "Eiffelturm", correct: true}],
                    shuffle: false,
                });
                break;
        }
        return shuffleArray(questions)
    }
}

export class CategoryLoader {
    static menschlicherKoerper: Category = {
        name: "Der Menschliche Körper",
        questionType: QuestionType.multipleChoice
    }
    static videogames: Category = {
        name: "Videospiele",
        questionType: QuestionType.multipleChoice
    }
    static fussball: Category = {
        name: "Fußball",
        questionType: QuestionType.multipleChoice
    }
    static essen: Category = {
        name: "Essen",
        questionType: QuestionType.multipleChoice
    }
    static traditionen: Category = {
        name: "Traditionen",
        questionType: QuestionType.multipleChoice
    }
    static filmeUndSerien: Category = {
        name: "Filme und Serien",
        questionType: QuestionType.multipleChoice
    }
    static literatur: Category = {
        name: "Literatur und Sprache",
        questionType: QuestionType.multipleChoice
    }
    static gadgetsAndGizmos: Category = {
        name: "Dinge",
        questionType: QuestionType.multipleChoice
    }
    static phobien: Category = {
        name: "Phobien",
        questionType: QuestionType.openEnded
    }
    static werBinIch: Category = {
        name: "Wer bin ich?",
        questionType: QuestionType.openEnded
    }
    static sehenswuerdigkeiten: Category = {
        name: "Sehenswürdigkeiten",
        questionType: QuestionType.openEnded
    }
    static inDiesemJahr: Category = {
        name: "In diesem Jahr...",
        questionType: QuestionType.openEnded
    }
    static allMusic: Category = {
        name: "Bunt gemischt",
        questionType: QuestionType.music,
        musicFilterStatement: (music: MusicQuestion) => {
            return true
        }
    }
    static popMusic: Category = {
        name: "Pop",
        questionType: QuestionType.music,
        musicFilterStatement: (music: MusicQuestion) => {
            return music.information.genre === Genre.pop
        }
    }
    static schlagerMusic: Category = {
        name: "Schlager",
        questionType: QuestionType.music,
        musicFilterStatement: (music: MusicQuestion) => {
            return music.information.genre === Genre.schlager
        }
    }
    static hipHopMusic: Category = {
        name: "Hip Hop",
        questionType: QuestionType.music,
        musicFilterStatement: (music: MusicQuestion) => {
            return music.information.genre === Genre.hiphop
        }
    }

    public static loadCategories(questionType: QuestionType) {
        let categories: Category[] = [];

        categories.push(CategoryLoader.menschlicherKoerper);
        categories.push(CategoryLoader.videogames);
        categories.push(CategoryLoader.fussball);
        categories.push(CategoryLoader.essen);
        categories.push(CategoryLoader.traditionen);
        categories.push(CategoryLoader.filmeUndSerien);
        categories.push(CategoryLoader.literatur);
        categories.push(CategoryLoader.gadgetsAndGizmos);
        categories.push(CategoryLoader.phobien);
        categories.push(CategoryLoader.werBinIch);
        categories.push(CategoryLoader.inDiesemJahr);
        categories.push(CategoryLoader.sehenswuerdigkeiten);
        categories.push(CategoryLoader.allMusic);
        categories.push(CategoryLoader.schlagerMusic);
        categories.push(CategoryLoader.popMusic);
        categories.push(CategoryLoader.hipHopMusic);

        return shuffleArray(categories.filter(cat => cat.questionType === questionType))
    }

}
