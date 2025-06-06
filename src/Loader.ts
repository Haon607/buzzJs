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
    drawAble: boolean;
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
                    answers: [
                        {answer: "Steißbein", correct: false, drawAble: true},
                        {answer: "Kreuzbein", correct: false, drawAble: false},
                        {answer: "Kniescheibe", correct: false, drawAble: true},
                        {answer: "Elle", correct: true, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: "Die Osteologie ist die Lehre von...",
                    answers: [
                        {answer: "Knochen und Knochenkrankheiten", correct: true, drawAble: false},
                        {answer: "Schmerzen und Schmerzenslinderung", correct: false, drawAble: false},
                        {answer: "Kräuter und Heilkräuter", correct: false, drawAble: true},
                        {answer: "Trauma und Traumatherapie", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: "Wo haben Menschen keine Muskeln?",
                    answers: [
                        {answer: "In den Fingern", correct: true, drawAble: true},
                        {answer: "In den Ohren", correct: false, drawAble: true},
                        {answer: "In der Nase", correct: false, drawAble: true},
                        {answer: "In den Oberschenkeln", correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: "Im Ohr ist ein kleines Organ welches für welchen Sinn verantwortlich ist?",
                    answers: [
                        {answer: "In den Fingern", correct: true, drawAble: false},
                        {answer: "In den Ohren", correct: false, drawAble: false},
                        {answer: "In der Nase", correct: false, drawAble: false},
                        {answer: "In den Oberschenkeln", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: "Welches Tier hat den besten Riecher?",
                    answers: [
                        {answer: "Bären", correct: true, drawAble: true},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: "Welcher Vogel hat die größten Eier?",
                    answers: [
                        {answer: "Strauß", correct: true, drawAble: true},
                        {answer: "Gans", correct: false, drawAble: true},
                        {answer: "Pfau", correct: false, drawAble: true},
                        {answer: "Truthahn", correct: false, drawAble: true}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.videogames.name:
                questions.push({
                    question: 'Aus wie vielen Quadraten bestehen alle "Tetris"-Blöcke?',
                    answers: [
                        {answer: "Drei", correct: false, drawAble: false},
                        {answer: "Vier", correct: true, drawAble: false},
                        {answer: "Fünf", correct: false, drawAble: false},
                        {answer: "Sechs", correct: false, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'In welchem 2023 erschienen Horrorspiel ist das Ziel, möglichst viele Gegenstände aus einem verlassenen Gebäude zu holen?',
                    answers: [
                        {answer: "Lethal Company", correct: true, drawAble: true},
                        {answer: "Phasmophobia", correct: false, drawAble: true},
                        {answer: "Among Us", correct: false, drawAble: true},
                        {answer: "Content Warning", correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Der Protagonist Solid Snake stammt aus welcher Videospielserie?',
                    answers: [
                        {answer: "Metal Gear", correct: true, drawAble: true},
                        {answer: "Ultimate Chicken Horse", correct: false, drawAble: true},
                        {answer: "Scrap Mechanic", correct: false, drawAble: true},
                        {answer: "Assassin's Creed", correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Das erste Videospiel Pong wurde in welchem Jahr veröffentlicht?',
                    answers: [
                        {answer: "1961", correct: false, drawAble: false},
                        {answer: "1972", correct: true, drawAble: false},
                        {answer: "1983", correct: false, drawAble: false},
                        {answer: "1994", correct: false, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie viele Runden pro Rennen fährt man im klassischen Super Mario Kart für das SNES?',
                    answers: [
                        {answer: "1", correct: false, drawAble: false},
                        {answer: "3", correct: false, drawAble: false},
                        {answer: "5", correct: true, drawAble: false},
                        {answer: "7", correct: false, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: '',
                    answers: [
                        {answer: "Rollercoaster Tycoon", correct: true, drawAble: true},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: '',
                    answers: [
                        {answer: "Kingdom Hearts", correct: true, drawAble: true},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wie heißt die erfolgreiche Globalstrategie-Computerspielreihe die von "Sid Meier" entwickelt wurde und 2025 den 7. Ableger bekommt?',
                    answers: [
                        {answer: "Civilization", correct: true, drawAble: true},
                        {answer: "Rollercoaster Tycoon", correct: false, drawAble: false},
                        {answer: "Monster Hunter", correct: false, drawAble: true},
                        {answer: "X-COM", correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wie heißt KEIN Geist aus Pac Man?',
                    answers: [
                        {answer: "", correct: true, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.traditionen.name:
                questions.push({
                    question: 'In welche Monate kann das Chinesische Neujahrsfest fallen?',
                    answers: [
                        {answer: "Dezember oder Jänner", correct: false, drawAble: false},
                        {answer: "Jänner oder Februar", correct: true, drawAble: false},
                        {answer: "Februar oder März", correct: false, drawAble: false},
                        {answer: "März oder April", correct: false, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Während bei uns am 26. Dezember Stefanitag ist, heißt der Feiertag in Großbritannien...',
                    answers: [
                        {answer: "Boxing Day", correct: true, drawAble: false},
                        {answer: "Playing Day", correct: false, drawAble: false},
                        {answer: "Sprinting Day", correct: false, drawAble: false},
                        {answer: "Drinking Day", correct: false, drawAble: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.filmeUndSerien.name:
                questions.push({
                    question: 'Wie heißt das Stammcafé von Rachel, Phoebe, Monica, Joey, Ross und Chandler in dem US-Serienklassiker Friends?',
                    answers: [
                        {answer: "Central Perk", correct: true, drawAble: false},
                        {answer: "Rock à Fella", correct: false, drawAble: false},
                        {answer: "Mainhatten", correct: false, drawAble: false},
                        {answer: "Coffeens", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welches Studio produziert günstige, profitable Horrorfilme wie "Paranormal Activity" und "The Purge"?',
                    answers: [
                        {answer: "Blumhouse Productions", correct: true, drawAble: false},
                        {answer: "Studio Babelsberg", correct: false, drawAble: false},
                        {answer: "Screen Gems", correct: false, drawAble: false},
                        {answer: "Fine Line Features", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Was hat Alfred Hitchcock im Film „Psycho“ als Blut verwendet?',
                    answers: [
                        {answer: 'Schokoladensirup', correct: true, drawAble: true},
                        {answer: 'Ketchup', correct: false, drawAble: true},
                        {answer: 'Lebensmittelfarbe', correct: false, drawAble: true},
                        {answer: 'Ahornsirup', correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Auf welcher Kultur basiert der Disney-Animationsfilm „Vaiana“ aus dem Jahr 2016?',
                    answers: [
                        {answer: 'Polynesisch', correct: true, drawAble: false},
                        {answer: 'Amerikanischer Ureinwohner', correct: false, drawAble: true},
                        {answer: 'Japanisch', correct: false, drawAble: true},
                        {answer: 'Nordisch', correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Nach welcher Tageszeit sollte man Mogwai im Film Gremlins nicht mehr füttern?',
                    answers: [
                        {answer: 'Mitternachts', correct: true, drawAble: true},
                        {answer: 'Abends', correct: false, drawAble: true},
                        {answer: 'Morgens', correct: false, drawAble: true},
                        {answer: 'Nachmittags', correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welche Geschwindigkeit muss Doc Browns DeLorean im Film „Zurück in die Zukunft“ erreichen, um durch die Zeit zu reisen?',
                    answers: [
                        {answer: '110 km/h (70 mph)', correct: false, drawAble: false},
                        {answer: '124 km/h (77 mph)', correct: false, drawAble: false},
                        {answer: '140 km/h (88 mph)', correct: true, drawAble: false},
                        {answer: '160 km/h (100 mph)', correct: false, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Welche Fortsetzung eines Films hatte im Vergleich zum Originalfilm bessere Kassenergebnisse?',
                    answers: [
                        {answer: 'Toy Story 2', correct: true, drawAble: true},
                        {answer: 'Sin City: A Dame to Kill For', correct: false, drawAble: false},
                        {answer: 'Speed 2', correct: false, drawAble: false},
                        {answer: 'Die Maske 2: Die nächste Generation', correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wie hieß der erste Bond-Film, der 1962 erschien?',
                    answers: [
                        {answer: 'James Bond – 007 jagt Dr. No', correct: true, drawAble: true},
                        {answer: 'James Bond 007 – In tödlicher Mission', correct: false, drawAble: false},
                        {answer: 'Goldfinger', correct: false, drawAble: true},
                        {answer: 'Keine Zeit zu sterben', correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'In welchem Film von 1973 spielt Yul Brynner einen Roboter-Cowboy, der eine Fehlfunktion hat und einen Amoklauf unternimmt?',
                    answers: [
                        {answer: 'Westworld', correct: true, drawAble: false},
                        {answer: 'Runaway', correct: false, drawAble: false},
                        {answer: 'Android', correct: false, drawAble: true},
                        {answer: 'Terminator', correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Bei welchem dieser Filmen war Quentin Tarantino nicht der Regisseur?',
                    answers: [
                        {answer: 'From Dusk till Dawn', correct: true, drawAble: true},
                        {answer: 'Jackie Brown', correct: false, drawAble: false},
                        {answer: 'Pulp Fiction', correct: false, drawAble: true},
                        {answer: 'Reservoir Dogs', correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welchen Namen hatte Mulan, als sie sich als Krieger ausgegeben hat?',
                    answers: [
                        {answer: 'Ping', correct: true, drawAble: false},
                        {answer: 'Fa Zhou', correct: false, drawAble: false},
                        {answer: 'Ling', correct: false, drawAble: false},
                        {answer: 'Shang', correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: '"E.T. – Der Außerirdische" war bis zur Veröffentlichung von welchem Film der erfolgreichste Film aller Zeiten?',
                    answers: [
                        {answer: 'Jurassic Park', correct: true, drawAble: true},
                        {answer: 'Gremlins', correct: false, drawAble: true},
                        {answer: 'E.T. 2', correct: false, drawAble: false},
                        {answer: 'Zurück in die Zukunft', correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welcher James Bond Film kam nach der Jahrtausendwende als erstes in die Kinos?',
                    answers: [
                        {answer: 'Stirb an einem anderen Tag', correct: true, drawAble: true},
                        {answer: 'Feuerball', correct: false, drawAble: true},
                        {answer: 'GoldenEye', correct: false, drawAble: false},
                        {answer: 'Die Welt ist nicht genug', correct: false, drawAble: true}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.essen.name:
                questions.push({
                    question: 'Welcher Snack kann Schisch oder Döner sein?',
                    answers: [
                        {answer: "Kebab", correct: true, drawAble: true},
                        {answer: "Hot Dog", correct: false, drawAble: true},
                        {answer: "Burger", correct: false, drawAble: true},
                        {answer: "Falafel", correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wieviele von diesen Nutella Gläsern müsste ich konsumieren um die Tagesration an Zucker zu erreichen?',
                    answers: [
                        {answer: "", correct: true, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.literatur.name:
                questions.push({
                    question: '"Nennt mich Ismael", so beginnt der berühmte Roman...',
                    answers: [
                        {answer: "Moby Dick", correct: true, drawAble: true},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Das Buch "3096 Tage" ist die Autobiografie von...',
                    answers: [
                        {answer: "Natascha Kampusch", correct: true, drawAble: false},
                        {answer: "Papst Franziskus", correct: false, drawAble: true},
                        {answer: "Marina Nemat", correct: false, drawAble: false},
                        {answer: "Helmut Berger", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Das Wort "LASER" ist ein...',
                    answers: [
                        {answer: "Akronym", correct: true, drawAble: false},
                        {answer: "Antonym", correct: false, drawAble: false},
                        {answer: "Palindrom", correct: false, drawAble: false},
                        {answer: "Tautonym", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'In welchem Bereich würde mir das Wort "Dénouement" begegnen?',
                    answers: [
                        {answer: "Theaterwissenschaft", correct: true, drawAble: false},
                        {answer: "Backtechnik", correct: false, drawAble: false},
                        {answer: "Sportanalyse", correct: false, drawAble: false},
                        {answer: "Automobilindustrie", correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Bei Büchern von welchem Autor wird man Käfer drinnen finden?',
                    answers: [
                        {answer: "Kafka", correct: true, drawAble: false},
                        {answer: "Satre", correct: false, drawAble: false},
                        {answer: "Camus", correct: false, drawAble: false},
                        {answer: "Tolstoy", correct: false, drawAble: false}],
                    shuffle: true,
                });
                break;
            case CategoryLoader.gadgetsAndGizmos.name:
                questions.push({
                    question: 'Welche Sprache spricht ein Furby?',
                    answers: [
                        {answer: "Furbish", correct: true, drawAble: false},
                        {answer: "Furrit", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Für was steht die Abkürzung GPS?',
                    answers: [
                        {answer: "Global Positioning System", correct: true, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false},
                        {answer: "", correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Fast schon universal hat die "Erdung"-Ader in Stromkabeln welche farbe?',
                    answers: [
                        {answer: "Grün", correct: true, drawAble: true},
                        {answer: "Rot", correct: false, drawAble: true},
                        {answer: "Blau", correct: false, drawAble: true},
                        {answer: "Schwarz", correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wer hat die Dampfmaschine, die Rotationsbewegung produziert, patentiert?',
                    answers: [
                        {answer: 'James Watt', correct: true, drawAble: true},
                        {answer: 'Nikola Tesla', correct: false, drawAble: true},
                        {answer: 'Albert Einstein', correct: false, drawAble: true},
                        {answer: 'Alessandro Volta', correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welche dieser Smartphone produzierenden Firmen hat ihren Sitz nicht in Asien?',
                    answers: [
                        {answer: 'Nokia', correct: true, drawAble: true},
                        {answer: 'LG Electronics', correct: false, drawAble: false},
                        {answer: 'Samsung', correct: false, drawAble: true},
                        {answer: 'HTC', correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Die Firma "Blackberry" hat wurde in welchem Land gegründet?',
                    answers: [
                        {answer: 'Kanada', correct: true, drawAble: true},
                        {answer: 'Norwegen', correct: false, drawAble: true},
                        {answer: 'Vereinigten Staaten von Amerika', correct: false, drawAble: true},
                        {answer: 'Großbritannien', correct: false, drawAble: true}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Welche Firma hat den "Walkman" produziert?',
                    answers: [
                        {answer: 'Sony', correct: true, drawAble: true},
                        {answer: 'Panasonic', correct: false, drawAble: false},
                        {answer: 'LG', correct: false, drawAble: true},
                        {answer: 'Fujitsu', correct: false, drawAble: false}],
                    shuffle: true,
                });
                questions.push({
                    question: 'Wann wurde das erste Tamagotchi im Handel erhältlich?',
                    answers: [
                        {answer: '1985', correct: false, drawAble: false},
                        {answer: '1996', correct: true, drawAble: false},
                        {answer: '2001', correct: false, drawAble: false},
                        {answer: '2004', correct: false, drawAble: false}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.majorlyMissspelled.name:
                questions.push({
                    question: 'Wer schrieb die Romane "Farm der Tiere" und "1984"?',
                    answers: [
                        {answer: "Jorjor Wel"/*George Orwell*/, correct: true, drawAble: false},
                        {answer: "Yll'se Eikingr"/*Illse Eichinger*/, correct: false, drawAble: false},
                        {answer: "Maysink Laire"/*May Sinclair*/, correct: false, drawAble: false},
                        {answer: "Tchonos Born"/*John Osborne*/, correct: false, drawAble: false}],
                    shuffle: true,
                });
                break;

            case CategoryLoader.phobiasAndSicknesses.name:
                questions.push({
                    question: "Vor welchen Brummern hat eine Person mit Apiphobie angst?",
                    answers: [{answer: "bienenartige Insekten", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: "Mit Cherophobie muss man ziemlich unglücklich Leben, denn diese Beschreibt die Angst vor...",
                    answers: [{answer: "Glücklichsein", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Die durch Soziale Netzwerke populär gewordene "FOMO" beschreibt welche Angst?',
                    answers: [{answer: "FEAR OF MISSING OUT", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie nennt man die Angst vor engen Räumen?',
                    answers: [{answer: "Klaustrophobie", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie nennt man umgangssprachlich die Akrophobie, die beim Betreten von Hochhäusern, Brücken oder Aussichtstürmen auftreten kann?',
                    answers: [{answer: "Höhenangst", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie heißt die Impulskontrollstörung, unter der eine Person leidet, die zwanghaft Dinge stiehlt?',
                    answers: [{answer: "Kleptomanie", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'kakorrhaphiophobia',
                    answers: [{answer: "", correct: true, drawAble: false}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.werBinIch.name:
                questions.push({
                    question: 'Ich habe mich für eine Pille entschieden, die Morpheus mir angeboten hat.',
                    answers: [{answer: "Neo (Matrix)", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Auf meinen Weg nach Indien "entdeckte" ich Amerika',
                    answers: [{answer: "Christoph Kolumbus", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: '',
                    answers: [{answer: "Simon Cowell", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Ich war reichster Mensch der Welt, 1964 geboren und bin Gründer von Amazon.',
                    answers: [{answer: "Jeff Bezos", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: '',
                    answers: [{answer: "Mark Zuckerberg", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: '',
                    answers: [{answer: "Boris Johnson", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Ich sagte: "Ich bin ein Berliner"',
                    answers: [{answer: "John F. Kennedy", correct: true, drawAble: true}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.sehenswuerdigkeiten.name:
                questions.push({
                    question: 'In welchem Land liegt die längste Mauer der Welt?',
                    answers: [{answer: "China", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Mit 330 Metern höhe steht welches Bauwerk im 7. Arrondissement der viertgrößten Stadt Europas?',
                    answers: [{answer: "Eiffelturm", correct: true, drawAble: true}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie nennt man das größte je gebaute Amphitheater der Welt heute?',
                    answers: [{answer: "Kolosseum", correct: true, drawAble: true}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.abbreviations.name:
                questions.push({
                    question: 'Für was steht die Abkürzung "GAU" in "Super-GAU"?',
                    answers: [{answer: "größter anzunehmender Unfall", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Was bedeutet die Abkürzung "FBI"?',
                    answers: [{answer: "Federal Bureau of Investigation", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Was bedeutet die Abkürzung "WC"?',
                    answers: [{answer: "water closet / Wasserklosett", correct: true, drawAble: false}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.inDiesemJahr.name:
                questions.push({
                    question: 'Titanik kommt raus',
                    answers: [{answer: "?", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Putin beginnt seine Zweite Amtszeit als Präsident von Russland, Heinz Fischer wird zum Bundespräsidenten von Österreich gewählt und die Ukraine gewinnt den ESC',
                    answers: [{answer: "2004", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Natascha Kampusch entkommt ihren Entführer',
                    answers: [{answer: "2006", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Die Olympischen Winterspiele sind in Vancouver, One Direction wird gegründet und in diesem Jahr hat "Lena" mit "Satellite" für Deutschland den ESC gewonnen',
                    answers: [{answer: "2010", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Das letzte mal fand der ESC in Österreich statt, Amazon Echo Geräte werden das erste mal im Handel angeboten und 150 Jahre Wiener Ringstraße wurden gefeiert',
                    answers: [{answer: "2015", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Gustav Klimt ist seit 100 Jahren Tod, ',
                    answers: [{answer: "2018", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Fortnite Weltmeisterschaft, Ibiza Affäre und Nationalratswahlen',
                    answers: [{answer: "2019", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Weihnachten fällt auf den 25 Dezember, das Vereinigte Königreich tritt aus der EU aus, George Floyd wurde ermordet und Corona wird zur Pandemie erklärt',
                    answers: [{answer: "2020", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Olaf Scholz wird Bundeskanzler von Deutschland, Alexander Schallenberg ist österreichischer Bundeskanzler und des Sueskanal wird für 6 Tage blockiert',
                    answers: [{answer: "2021", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Der Sommer dieses Jahres war der heißeste seit beginn der Aufzeichnungen, Sebastian Vettel gibt das Ende seiner Formel-1-Karriere bekannt und Russland beginnt den Krieg gegen die Ukraine',
                    answers: [{answer: "2022", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'In Deutschland werden die letzten Kernreaktoren abgeschaltet, das U-Boot des Unternehmens "OceanGate" implodiert und Finnland wird 31. Mitglied der NATO',
                    answers: [{answer: "2023", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Österreich wählt einen Nationalrat, Hochwasser legte große Teile von Mitteleuropa lahm und die Schweiz gewinnt den ESC',
                    answers: [{answer: "2024", correct: true, drawAble: false}],
                    shuffle: false,
                });
                break;
            case CategoryLoader.sport.name:
                questions.push({
                    question: 'Was ist die Höchstpunktzahl, die man in einer klassischen Runde Bowling erzielen kann?',
                    answers: [{answer: "300", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Wie viele Darts müssen mindestens geworfen werden, um am schnellsten ein 301 Spiel in Darts zu beenden?',
                    answers: [{answer: "Sechs", correct: true, drawAble: false}],
                    shuffle: false,
                });
                questions.push({
                    question: 'Welches Land hat die meisten olympischen Sommer- und Winterspiele gehosted?',
                    answers: [{answer: "", correct: true, drawAble: false}],
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

        return shuffleArray(categories.filter(cat => {
            if (questionType !== QuestionType.drawing) return cat.questionType === questionType;
            else return QuestionLoader.loadQuestion(cat).some(question => question.answers.some(answer => answer.drawAble));
        }));
    }

}
