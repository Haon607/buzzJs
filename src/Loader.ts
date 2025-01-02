import { shuffleArray } from './utils';

export interface Question {
    question: string;
    answers: Answer[];
    shuffle: boolean;
}

export enum QuestionType {
    multipleChoice,
    buzzer
}

export interface Answer {
    answer: string;
    correct: boolean;
}

export interface Category {
    name: string;
    questionType: QuestionType;
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
                break;
            case CategoryLoader.videospiele.name:
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
                    question: '',
                    answers: [{answer: "1961", correct: false}, {answer: "1972", correct: true}, {answer: "1983", correct: false}, {answer: "1994", correct: false}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.traditionen.name:
                questions.push({
                    question: 'In welche Monate kann das Chinesische Neujahrsfest fallen?',
                    answers: [{answer: "Dezember oder Jänner", correct: false}, {answer: "Jänner oder Februar", correct: true}, {answer: "Februar oder März", correct: false}, {answer: "März oder April", correct: false}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.filmeUndSerien.name:
                questions.push({
                    question: 'Wie heißt das Stammcafé von Rachel, Phoebe, Monica, Joey, Ross und Chandler in dem US-Serienklassiker Friends',
                    answers: [{answer: "Central Perk", correct: true}, {answer: "Rock à Fella", correct: false}, {answer: "Mainhatten", correct: false}, {answer: "Coffeens", correct: false}],
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
        }

        return shuffleArray(questions)
    }
}

export class CategoryLoader {
    static menschlicherKoerper: Category = {
        name: "Der Menschliche Körper",
        questionType: QuestionType.multipleChoice
    }
    static videospiele: Category = {
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
    static phobien: Category = {
        name: "Phobien",
        questionType: QuestionType.buzzer
    }
    static werBinIch: Category = {
        name: "Wer bin ich?",
        questionType: QuestionType.buzzer
    }
    static sehenswuerdigkeiten: Category = {
        name: "Sehenswürdigkeiten",
        questionType: QuestionType.buzzer
    }
    static inDiesemJahr: Category = {
        name: "In diesem Jahr...",
        questionType: QuestionType.buzzer
    }

    public static loadCategories(questionType: QuestionType) {
        let categories: Category[] = [];

        switch (questionType) {
            case QuestionType.multipleChoice:
                categories.push(CategoryLoader.menschlicherKoerper);
                categories.push(CategoryLoader.videospiele);
                categories.push(CategoryLoader.fussball);
                categories.push(CategoryLoader.essen);
                categories.push(CategoryLoader.traditionen);
                categories.push(CategoryLoader.filmeUndSerien);
                categories.push(CategoryLoader.literatur);
                break;
            case QuestionType.buzzer:
                categories.push(CategoryLoader.phobien);
                categories.push(CategoryLoader.werBinIch);
                categories.push(CategoryLoader.inDiesemJahr);
                categories.push(CategoryLoader.sehenswuerdigkeiten);
                break;
        }

        return shuffleArray(categories)
    }

}
