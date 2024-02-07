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
    remove: HTMLButtonElement
};

type Card = {
    setCode: string,
    collectorNumber: number,
    languageCode: string
};

type Selection = Card & {
    isFoil: boolean
};

function areCardsEqual(card1: Card | undefined | null, card2: Card | undefined | null) : boolean {
    if((card1 === undefined || card1 === null) && (card2 === undefined || card2 === null)) {
        return true
    }
    else if(card1 !== undefined && card1 !== null && card2 !== undefined && card2 !== null) {
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

    private lastSelectedCard: Card | undefined = undefined;

    public constructor(options: ControllerOptions) {
        super();

        this.setInput = options.set;
        this.collectorInput = options.card;
        this.languageSelector = options.language;
        this.preview = options.preview;
        this.add = options.add;
        this.remove = options.remove;
    }

    public attach() {
        this.collectorInput.addEventListener("keypress", event => this.inputListener(event));
        this.add.addEventListener("click", event => this.addCardListener(event));
        this.remove.addEventListener("click", event => this.removeCardListener(event));
    }

    private inputListener(event: KeyboardEvent) {
        if(event.key === "Enter") {
            this.fetchCardListener(event);
        }
        else if(event.key === "+") {
            this.addCardListener(event);
        }
        else if(event.key === "-") {
            this.removeCardListener(event);
        }
    }

    private fetchCardListener(event: MouseEvent | KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();
        
        const selection = this.getValidSelection(event);
        if(selection != null) {
            this.selectCard(selection);
        }
    }

    private addCardListener(event: MouseEvent | KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const selection = this.getValidSelection(event);
        if(selection != null) {
            this.selectCard(selection);

            const done = this.collection.add(selection);
            if(done) {
                this.emitEvent("changed", this.collection);
                this.launchPlusOneParticle();
            }
        }
    }

    private removeCardListener(event: MouseEvent | KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const selection = this.getValidSelection(event);
        if(selection != null) {
            this.selectCard(selection);

            const done = this.collection.remove(selection);
            if(done) {
                this.emitEvent("changed", this.collection);
                this.launchMinusOneParticle();
            }
        }
    }
    
    private getValidSelection(event: KeyboardEvent | MouseEvent) : Selection | null {
        if(this.setInput.reportValidity()) {
            const setCode = this.setInput.value;

            if(this.collectorInput.reportValidity()) {
                const collectorNumber = parseInt(this.collectorInput.value);

                if(this.languageSelector.reportValidity()) {
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

    private selectCard(card: Card) {
        if(!areCardsEqual(this.lastSelectedCard, card)) {
            this.cardFetcherWithFallBack(card);
            this.lastSelectedCard = card;
        }
    }

    private cardFetcherWithFallBack(selection: Card) {
        this.cardFetcher(selection)
        .catch(() => this.cardFetcher({...selection, languageCode: "en"}))
        .catch(() => this.cardFetcher({...selection, languageCode: "ph"}))
        .catch(() => this.preview.src = notFound);
    }

    private async cardFetcher(selection: Card) {
        this.preview.src = searching;

        const card = await Scry.Cards.bySet(selection.setCode, selection.collectorNumber, selection.languageCode);
        this.preview.src = card.card_faces[0].image_uris?.large || "";
        this.collectorInput.focus();
        this.collectorInput.select();
    }

    private launchPlusOneParticle() {
        const element = document.createElement("span");
        element.innerText = "+1";
        element.style.fontSize = "1.5rem";
        element.style.color = "#51A629";
        this.launchParticleRandomlyOverPreview(element);
    }

    private launchMinusOneParticle() {
        const element = document.createElement("span");
        element.innerText = "-1";
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