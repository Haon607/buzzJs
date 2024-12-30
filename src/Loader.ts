import { shuffleArray } from './utils';

export interface Question {
    Question: string;
    Answers: Answer[];
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
                    Question: "Welcher dieser menschlichen Knochen hat keine dreieckige Form?",
                    Answers: [{answer: "Steißbein", correct: false}, {answer: "Kreuzbein", correct: false}, {answer: "Kniescheibe", correct: false}, {answer: "Elle", correct: true}],
                    shuffle: true,
                });
                questions.push({
                    Question: "Die Osteologie ist die Lehre von...",
                    Answers: [{answer: "Knochen und Knochenkrankheiten", correct: true}, {answer: "Schmerzen und Schmerzenslinderung", correct: false}, {answer: "Kräuter und Heilkräuter", correct: false}, {answer: "Trauma und Traumatherapie", correct: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.videospiele.name:
                questions.push({
                    Question: 'Aus wie vielen Quadraten bestehen alle "Tetris"-Blöcke?',
                    Answers: [{answer: "Drei", correct: false}, {answer: "Vier", correct: true}, {answer: "Fünf", correct: false}, {answer: "Sechs", correct: false}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.phobien.name:
                questions.push({
                    Question: "Vor welchen Brummern hat eine Person mit Apiphobie angst?",
                    Answers: [{answer: "bienenartige Insekten", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    Question: "Mit Cherophobie muss man ziemlich unglücklich Leben, denn diese Beschreibt die Angst vor...",
                    Answers: [{answer: "Glücklichsein", correct: true}],
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
    static phobien: Category = {
        name: "Phobien",
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
                break;
            case QuestionType.buzzer:
                categories.push(CategoryLoader.phobien);
                break;
        }

        return shuffleArray(categories)
    }

}
