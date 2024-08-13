import * as Scry from "scryfall-sdk";
import SetSelector from "../components/set-selector";
import notFound from "/not_found.png";
import searching from "/searching.png";
import Collection from "./collection";
import Listenable from "./listenable";
import { launchParticle } from "./particle";

type ControllerOptions = {
    set: SetSelector,
    card: HTMLInputElement,
    language: HTMLSelectElement,
    preview: HTMLImageElement,
    add: HTMLButtonElement,
    remove: HTMLButtonElement,
    mode: HTMLButtonElement,
    alphabeticalStart: HTMLInputElement
};

type Card = {
    setCode: string,
    collectorNumber: string,
    languageCode: string
};

type Selection = Card & {
    isFoil: boolean
};

enum Mode {
    Extension,
    Alphabetical
}

function areCardsEqual(card1: Card | undefined | null, card2: Card | undefined | null): boolean {
    if ((card1 === undefined || card1 === null) && (card2 === undefined || card2 === null)) {
        return true
    }
    else if (card1 !== undefined && card1 !== null && card2 !== undefined && card2 !== null) {
        return card1.setCode === card2.setCode && card1.collectorNumber === card2.collectorNumber && card1.languageCode === card2.languageCode;
    }
    else {
        return false;
    }
}

export default class Controller extends Listenable(Object) {
    private collection: Collection = Collection.fromLocalStorage();
    private setInput: SetSelector;
    private collectorInput: HTMLInputElement;
    private languageSelector: HTMLSelectElement;
    private preview: HTMLImageElement;
    private add: HTMLButtonElement;
    private remove: HTMLButtonElement;
    private mode: HTMLButtonElement;
    private alphabeticalStart: HTMLInputElement;

    private lastSelectedCard: Card | undefined = undefined;
    private currentMode: Mode;

    public constructor(options: ControllerOptions) {
        super();

        this.setInput = options.set;
        this.collectorInput = options.card;
        this.languageSelector = options.language;
        this.preview = options.preview;
        this.add = options.add;
        this.remove = options.remove;
        this.mode = options.mode;
        this.alphabeticalStart = options.alphabeticalStart;

        this.currentMode = Mode.Extension;
    }

    public attach() {
        this.collectorInput.addEventListener("keypress", event => this.inputListener(event));
        this.add.addEventListener("click", event => this.addCardListener(event));
        this.remove.addEventListener("click", event => this.removeCardListener(event));
        this.mode.addEventListener("click", _ => this.changeModeListener());
    }

    private inputListener(event: KeyboardEvent) {
        if (event.key === "Enter") {
            this.fetchCardListener(event);
        }
        else if (event.key === "+") {
            this.addCardListener(event);
        }
        else if (event.key === "-") {
            this.removeCardListener(event);
        }
    }

    private fetchCardListener(event: MouseEvent | KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        this.makeSelection(event, false);
    }

    private async addCardListener(event: MouseEvent | KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const selection = await this.makeSelection(event, true);
        if (selection != null) {
            const done = this.collection.add(selection);
            if (done) {
                this.emitEvent("changed", this.collection);
                this.launchPlusOneParticle(selection.isFoil);
            }
        }
    }

    private async removeCardListener(event: MouseEvent | KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const selection = await this.makeSelection(event, true);
        if (selection != null) {
            const done = this.collection.remove(selection);
            if (done) {
                this.emitEvent("changed", this.collection);
                this.launchMinusOneParticle(selection.isFoil);
            }
        }
    }

    private changeModeListener() {
        const extension = document.getElementById("extension");
        const alphabetical = document.getElementById("alphabetical");

        if (extension && alphabetical) {
            const display = extension?.style.display;

            extension.style.display = alphabetical.style.display;
            alphabetical.style.display = display;

            const button = document.getElementById("change-mode");

            if (button) {
                if (this.currentMode == Mode.Extension) {
                    this.currentMode = Mode.Alphabetical;
                    button.innerText = "Alphabetical → Extension";
                } else {
                    this.currentMode = Mode.Extension;
                    button.innerText = "Extension → Alphabetical";
                }
            }
        }
    }

    private async makeSelection(event: KeyboardEvent | MouseEvent, addOrRemove: boolean): Promise<Selection | null> {
        var selection = null;

        if (this.currentMode == Mode.Extension) {
            selection = this.getValidSelectionExtension(event);
        } else {
            selection = await this.getValidSelectionAlphabetical(event, addOrRemove);
        }

        if (selection != null) {
            this.selectCard(selection);
        }

        return selection;
    }

    private getValidSelectionExtension(event: KeyboardEvent | MouseEvent): Selection | null {
        if (this.setInput.reportValidity()) {
            const setCode = this.setInput.value;

            if (this.collectorInput.reportValidity()) {
                const collectorNumber = this.collectorInput.value;

                if (this.languageSelector.reportValidity()) {
                    const languageCode = this.languageSelector.value;

                    return {
                        setCode: setCode,
                        collectorNumber: collectorNumber,
                        languageCode: languageCode,
                        isFoil: event.shiftKey
                    };
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }

    private async getValidSelectionAlphabetical(event: KeyboardEvent | MouseEvent, addOrRemove: boolean): Promise<Selection | null> {
        const alphabeticalStart = this.alphabeticalStart.value;

        if (this.collectorInput.reportValidity()) {
            const collectorNumber = parseInt(this.collectorInput.value);

            if (this.languageSelector.reportValidity()) {
                const languageCode = this.languageSelector.value;

                const card = await this.getNextCard(alphabeticalStart, collectorNumber, languageCode, addOrRemove);

                if (card) {
                    return { ...card, isFoil: event.shiftKey }
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }

    private async getNextCard(alphabeticalStart: string, collectorNumber: number, languageCode: string, addOrRemove: boolean): Promise<Card | null> {
        const normalStart = this.normalize(alphabeticalStart);

        const results = await Scry.Cards.search(`(game:paper) number:${collectorNumber} lang:${languageCode}`).waitForAll();
        const filtered = results.filter(card => {
            if (languageCode !== "en") {
                return card.printed_name && (!card.printed_name || (!addOrRemove && this.normalize(card.printed_name) > normalStart) || (addOrRemove && this.normalize(card.printed_name) >= normalStart));
            } else {
                return this.normalize(card.name) > normalStart;
            }
        });

        if (filtered.length > 0) {
            var bestCard: Scry.Card = filtered[0];

            if (languageCode !== "en") {
                filtered.forEach(card => {
                    if (bestCard.printed_name && card.printed_name && this.normalize(card.printed_name) < this.normalize(bestCard.printed_name)) {
                        bestCard = card;
                    }
                });
            }

            const input = document.getElementById("alphabeticalStart") as HTMLInputElement;

            if (input && !addOrRemove) {
                if (languageCode !== "en" && bestCard.printed_name) {
                    input.value = bestCard.printed_name;
                } else {
                    input.value = bestCard.name;
                }
            }

            return { setCode: bestCard.set, collectorNumber: bestCard.collector_number, languageCode: languageCode };
        }


        return null;
    }

    private selectCard(card: Card) {
        if (!areCardsEqual(this.lastSelectedCard, card)) {
            this.cardFetcherWithFallBack(card);
            this.lastSelectedCard = card;
        }
    }

    private normalize(str: string): string {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    private cardFetcherWithFallBack(selection: Card) {
        this.cardFetcher(selection)
            .catch(() => this.cardFetcher({ ...selection, languageCode: "en" }))
            .catch(() => this.cardFetcher({ ...selection, languageCode: "ph" }))
            .catch(() => this.preview.src = notFound);
    }

    private async cardFetcher(selection: Card) {
        this.preview.src = searching;

        const card = await Scry.Cards.bySet(selection.setCode, selection.collectorNumber, selection.languageCode);
        this.preview.src = card.card_faces[0].image_uris?.large || "";
        this.collectorInput.focus();
        this.collectorInput.select();
    }

    private launchPlusOneParticle(foil: boolean) {
        const element = document.createElement("span");
        element.innerHTML = `+1${foil ? "<sup>🌟</sup>" : ""}`;
        element.style.fontSize = "3.5rem";
        element.style.color = "#51A629";
        this.launchParticleRandomlyOverPreview(element);
    }

    private launchMinusOneParticle(foil: boolean) {
        const element = document.createElement("span");
        element.innerHTML = `-1${foil ? "<sup>🌟</sup>" : ""}`;
        element.style.fontSize = "1.5rem";
        element.style.color = "#D93A2B";
        this.launchParticleRandomlyOverPreview(element);
    }

    private launchParticleRandomlyOverPreview(element: HTMLElement) {
        const previewRect = this.preview.getBoundingClientRect();
        const lifetimeMs = 500;

        const randomStart = {
            x: previewRect.x + (previewRect.width * 0.90) + (previewRect.width * 0.10 * Math.random()),
            y: previewRect.y + (previewRect.height * 0.10) + (previewRect.height * 0.10 * Math.random())
        };

        const randomVelocity = {
            x: 0.5 + (0.5 * Math.random()),
            y: -(1 + (0.5 * Math.random()))
        }

        launchParticle(element, randomStart, randomVelocity, lifetimeMs);
    }

    public static mount(options: ControllerOptions): Controller {
        const fetcher = new Controller(options);
        fetcher.attach();
        return fetcher;
    }
}