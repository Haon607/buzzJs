import { randomNumber, shuffleArray } from './utils';
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
    drawing,
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
        const questions: Question[] = [];

        switch (category.name) {
            case CategoryLoader.Organismen.name:
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
                questions.push({
                    question: "Welches Tier hat den besten Riecher?",
                    answers: [{answer: "Bären", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false}],
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
                    question: 'Wie heißt das Stammcafé von Rachel, Phoebe, Monica, Joey, Ross und Chandler in dem US-Serienklassiker Friends?',
                    answers: [{answer: "Central Perk", correct: true}, {answer: "Rock à Fella", correct: false}, {answer: "Mainhatten", correct: false}, {answer: "Coffeens", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welches Studio produziert günstige, profitable Horrorfilme wie "Paranormal Activity" und "The Purge"?',
                    answers: [{answer: "Blumhouse Productions", correct: true}, {answer: "Studio Babelsberg", correct: false}, {answer: "Screen Gems", correct: false}, {answer: "Fine Line Features", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Was hat Alfred Hitchcock im Film „Psycho“ als Blut verwendet?',
                    answers: [{answer: 'Schokoladensirup', correct: true}, {answer: 'Ketchup', correct: false}, {answer: 'Lebensmittelfarbe', correct: false}, {answer: 'Ahornsirup', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Auf welcher Kultur basiert der Disney-Animationsfilm „Vaiana“ aus dem Jahr 2016?',
                    answers: [{answer: 'Polynesisch', correct: true}, {answer: 'Amerikanischer Ureinwohner', correct: false}, {answer: 'Japanisch', correct: false}, {answer: 'Nordisch', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Nach welcher Tageszeit sollte man Mogwai im Film Gremlins nicht mehr füttern?',
                    answers: [{answer: 'Mitternachts', correct: true}, {answer: 'Abends', correct: false}, {answer: 'Morgens', correct: false}, {answer: 'Nachmittags', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welche Geschwindigkeit muss Doc Browns DeLorean im Film „Zurück in die Zukunft“ erreichen, um durch die Zeit zu reisen?',
                    answers: [{answer: '140 km/h (88 mph)', correct: true}, {answer: '124 km/h (77 mph)', correct: false}, {answer: '160 km/h (100 mph)', correct: false}, {answer: '110 km/h (70 mph)', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welche Fortsetzung eines Films hatte im Vergleich zum Originalfilm bessere Kassenergebnisse?',
                    answers: [{answer: 'Toy Story 2', correct: true}, {answer: 'Sin City: A Dame to Kill For', correct: false}, {answer: 'Speed 2', correct: false}, {answer: 'Die Maske 2: Die nächste Generation', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wie hieß der erste Bond-Film, der 1962 erschien?',
                    answers: [{answer: 'James Bond – 007 jagt Dr. No', correct: true}, {answer: 'James Bond 007 – In tödlicher Mission', correct: false}, {answer: 'Goldfinger', correct: false}, {answer: 'Keine Zeit zu sterben', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'In welchem Film von 1973 spielt Yul Brynner einen Roboter-Cowboy, der eine Fehlfunktion hat und einen Amoklauf unternimmt?',
                    answers: [{answer: 'Westworld', correct: true}, {answer: 'Runaway', correct: false}, {answer: 'Android', correct: false}, {answer: 'Terminator', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Bei welchem dieser Filmen war Quentin Tarantino nicht der Regisseur?',
                    answers: [{answer: 'From Dusk till Dawn', correct: true}, {answer: 'Jackie Brown', correct: false}, {answer: 'Pulp Fiction', correct: false}, {answer: 'Reservoir Dogs', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welchen Namen hatte Mulan, als sie sich als Krieger ausgegeben hat?',
                    answers: [{answer: 'Ping', correct: true}, {answer: 'Fa Zhou', correct: false}, {answer: 'Ling', correct: false}, {answer: 'Shang', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: '"E.T. – Der Außerirdische" war bis zur Veröffentlichung von welchem Film der erfolgreichste Film aller Zeiten?',
                    answers: [{answer: 'Jurassic Park', correct: true}, {answer: 'Gremlins', correct: false}, {answer: 'E.T. 2', correct: false}, {answer: 'Zurück in die Zukunft', correct: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.literatur.name:
                questions.push({
                    question: '"Nennt mich Ismael", so beginnt der berühmte Roman...',
                    answers: [{answer: "Moby Dick", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Das Buch "3096 Tage" ist die Autobiografie von...',
                    answers: [{answer: "Natascha Kampusch", correct: true}, {answer: "Papst Franziskus", correct: false}, {answer: "Marina Nemat", correct: false}, {answer: "Helmut Berger", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Das Wort "LASER" ist ein...',
                    answers: [{answer: "Akronym", correct: true}, {answer: "Antonym", correct: false}, {answer: "Palindrom", correct: false}, {answer: "Tautonym", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'In welchem Bereich würde mir das Wort "Dénouement" begegnen?',
                    answers: [{answer: "Theaterwissenschaft", correct: true}, {answer: "Backtechnik", correct: false}, {answer: "Sportanalyse", correct: false}, {answer: "Automobilindustrie", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Bei Büchern von welchem Autor wird man Käfer drinnen finden?',
                    answers: [{answer: "Kafka", correct: true}, {answer: "Satre", correct: false}, {answer: "Camus", correct: false}, {answer: "Tolstoy", correct: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.gadgetsAndGizmos.name:
                questions.push({
                    question: 'Welche Sprache spricht ein Furby?',
                    answers: [{answer: "Furbish", correct: true}, {answer: "Furrit", correct: false}, {answer: "", correct: false}, {answer: "", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Für was steht die Abkürzung GPS?',
                    answers: [{answer: "Global Positioning System", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Fast schon universal hat die "Erdung"-Ader in Stromkabeln welche farbe?',
                    answers: [{answer: "Grün", correct: true}, {answer: "Rot", correct: false}, {answer: "Blau", correct: false}, {answer: "Schwarz", correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wer hat die Dampfmaschine, die Rotationsbewegung produziert, patentiert?',
                    answers: [{answer: 'James Watt', correct: true}, {answer: 'Nikola Tesla', correct: false}, {answer: 'Albert Einstein', correct: false}, {answer: 'Alessandro Volta', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welche dieser Smartphone produzierenden Firmen hat ihren Sitz nicht in Asien?',
                    answers: [{answer: 'Nokia', correct: true}, {answer: 'LG Electronics', correct: false}, {answer: 'Samsung', correct: false}, {answer: 'HTC', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Die Firma "Blackberry" hat wurde in welchem Land gegründet?',
                    answers: [{answer: 'Canada', correct: true}, {answer: 'Norway', correct: false}, {answer: 'United States of America', correct: false}, {answer: 'United Kingdom', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welche Firma hat den "Walkman" produziert?',
                    answers: [{answer: 'Sony', correct: true}, {answer: 'Panasonic', correct: false}, {answer: 'LG', correct: false}, {answer: 'Fujitsu', correct: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wann wurde das erste Tamagotchi im Handel erhältlich?',
                    answers: [{answer: '1985', correct: false}, {answer: '1996', correct: true}, {answer: '2001', correct: false}, {answer: '2004', correct: false}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.majorlyMissspelled.name:
                questions.push({
                    question: 'Wer schrieb die Romane "Farm der Tiere" und "1984"?',
                    answers: [{answer: "Jorjor Wel"/*George Orwell*/, correct: true}, {answer: "Yll'se Eikingr"/*Illse Eichinger*/, correct: false}, {answer: "Maysink Laire"/*May Sinclair*/, correct: false}, {answer: "Tchonos Born"/*John Osborne*/, correct: false}],
                    shuffle: true,
                });
                break;

            case CategoryLoader.phobiasAndSicknesses.name:
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
                questions.push({
                    question: 'Wie heißt die Impulskontrollstörung, unter der eine Person leidet, die zwanghaft Dinge stiehlt?',
                    answers: [{answer: "Kleptomanie", correct: true}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.werBinIch.name:
                questions.push({
                    question: 'Ich habe mich für eine Pille entschieden, die Morpheus mir angeboten hat.',
                    answers: [{answer: "Neo (Matrix)", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Auf meinen Weg nach Indien "entdeckte" ich Amerika',
                    answers: [{answer: "Christoph Kolumbus", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: '',
                    answers: [{answer: "Simon Cowell", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Ich war reichster Mensch der Welt, 1964 geboren und bin Gründer von Amazon.',
                    answers: [{answer: "Jeff Bezos", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: '',
                    answers: [{answer: "Mark Zuckerberg", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: '',
                    answers: [{answer: "Boris Johnson", correct: true}],
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
                questions.push({
                    question: 'Wie nennt man das größte je gebaute Amphitheater der Welt heute?',
                    answers: [{answer: "Kolosseum", correct: true}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.abbreviations.name:
                questions.push({
                    question: 'FÜr was steht die Abkürzung "GAU" in "Super-GAU"`?',
                    answers: [{answer: "größter anzunehmender Unfall", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Was bedeutet die Abkürzung "FBI"?',
                    answers: [{answer: "Federal Bureau of Investigation", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Was bedeutet die Abkürzung "WC"?',
                    answers: [{answer: "water closet / Wasserklosett", correct: true}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.inDiesemJahr.name:
                questions.push({
                    question: 'Titanik kommt raus',
                    answers: [{answer: "?", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Putin beginnt seine Zweite Amtszeit als Präsident von Russland, Heinz Fischer wird zum Bundespräsidenten von Österreich gewählt und die Ukraine gewinnt den ESC',
                    answers: [{answer: "2004", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Natascha Kampusch entkommt ihren Entführer',
                    answers: [{answer: "2006", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Die Olympischen Winterspiele sind in Vancouver, One Direction wird gegründet und in diesem Jahr hat "Lena" mit "Satellite" für Deutschland den ESC gewonnen',
                    answers: [{answer: "2010", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Das letzte mal fand der ESC in Österreich statt, Amazon Echo Geräte werden das erste mal im Handel angeboten und 150 Jahre Wiener Ringstraße wurden gefeiert',
                    answers: [{answer: "2015", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Gustav Klimt ist seit 100 Jahren Tod, ',
                    answers: [{answer: "2018", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Fortnite Weltmeisterschaft, Ibiza Affäre und Nationalratswahlen',
                    answers: [{answer: "2019", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Weihnachten fällt auf den 25 Dezember, das Vereinigte Königreich tritt aus der EU aus, George Floyd wurde ermordet und Corona wird zur Pandemie erklärt',
                    answers: [{answer: "2020", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Olaf Scholz wird Bundeskanzler von Deutschland, Alexander Schallenberg ist österreichischer Bundeskanzler und des Sueskanal wird für 6 Tage blockiert',
                    answers: [{answer: "2021", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Der Sommer dieses Jahres war der heißeste seit beginn der Aufzeichnungen, Sebastian Vettel gibt das Ende seiner Formel-1-Karriere bekannt und Russland beginnt den Krieg gegen die Ukraine',
                    answers: [{answer: "2022", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'In Deutschland werden die letzten Kernreaktoren abgeschaltet, das U-Boot des Unternehmens "OceanGate" implodiert und Finnland wird 31. Mitglied der NATO',
                    answers: [{answer: "2023", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Österreich wählt einen Nationalrat, Hochwasser legte große Teile von Mitteleuropa lahm und die Schweiz gewinnt den ESC',
                    answers: [{answer: "2024", correct: true}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.sport.name:
                questions.push({
                    question: 'Was ist die Höchstpunktzahl, die man in einer klassischen Runde Bowling erzielen kann?',
                    answers: [{answer: "300", correct: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie viele Darts müssen mindestens geworfen werden, um am schnellsten ein 301 Spiel in Darts zu beenden?',
                    answers: [{answer: "Sechs", correct: true}],
                    shuffle: false,
                });
                break;
        }
        // questions = questions.map(quest => {
        //     return {
        //         ...quest, question: quest.question.toUpperCase(), answers: quest.answers.map(ans => {
        //             return {
        //                 ...ans, answer: ans.answer.toUpperCase()
        //             }
        //         })
        //     }
        // })
        return shuffleArray(questions)
    }
}

export class CategoryLoader {
    static Organismen: Category = {
        name: "Organismen",
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
        name: "Dinge und Geräte",
        questionType: QuestionType.multipleChoice
    }
    static majorlyMissspelled: Category = {
        name: "Typos und Lautsprache",
        questionType: QuestionType.multipleChoice
    }
    static phobiasAndSicknesses: Category = {
        name: "Phobien und Krankheiten",
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
    static abbreviations: Category = {
        name: "Abkürzungen",
        questionType: QuestionType.openEnded
    }
    static sport: Category = {
        name: "Sport",
        questionType: QuestionType.openEnded
    }
    static allMusic: Category = {
        name: randomNumber(0, 1) === 0 ? randomNumber(0, 1) === 0 ? randomNumber(0, 1) === 0 ? randomNumber(0, 1) === 0 ? "Bunt durchmischt" : "Alle" : randomNumber(0, 1) === 0 ? "Keine Grenzen" : '"Ich höre alle Genres"' : randomNumber(0, 1) === 0 ? randomNumber(0, 1) === 0 ? "Generationenübergreifend" : "Zufall" : randomNumber(0, 1) === 0 ? "Alle machen mit" : "Keine Ausgrenzung" : randomNumber(0, 1) === 0 ? randomNumber(0, 1) === 0 ? randomNumber(0, 1) === 0 ? '"I listen to everything"' : "Gruppen oder Einzelpersonen" : randomNumber(0, 1) === 0 ? "Alle Sprachen" : "Lass den Zufall entscheiden" : randomNumber(0, 1) === 0 ? randomNumber(0, 1) === 0 ? "Komme was wolle" : "Mehr geht nicht" : randomNumber(0, 1) === 0 ? "Wilder Mix" : "Alles dabei!",
        questionType: QuestionType.music,
        musicFilterStatement: () => {
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
    static drawing: Category = {
        name: "Malen",
        questionType: QuestionType.drawing,
    }

    public static loadCategories(questionType: QuestionType) {
        const categories: Category[] = [];

        categories.push(CategoryLoader.Organismen);
        categories.push(CategoryLoader.videogames);
        categories.push(CategoryLoader.fussball);
        categories.push(CategoryLoader.essen);
        categories.push(CategoryLoader.traditionen);
        categories.push(CategoryLoader.filmeUndSerien);
        categories.push(CategoryLoader.literatur);
        categories.push(CategoryLoader.gadgetsAndGizmos);
        categories.push(CategoryLoader.majorlyMissspelled);
        categories.push(CategoryLoader.phobiasAndSicknesses);
        categories.push(CategoryLoader.werBinIch);
        categories.push(CategoryLoader.inDiesemJahr);
        categories.push(CategoryLoader.sehenswuerdigkeiten);
        categories.push(CategoryLoader.abbreviations);
        categories.push(CategoryLoader.sport);
        categories.push(CategoryLoader.allMusic);
        categories.push(CategoryLoader.schlagerMusic);
        categories.push(CategoryLoader.popMusic);
        categories.push(CategoryLoader.hipHopMusic);
        categories.push(CategoryLoader.drawing);

        return shuffleArray(categories.filter(cat => cat.questionType === questionType))
    }

}
