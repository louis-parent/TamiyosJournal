import * as Scry from "scryfall-sdk";
import SetSelector from "../components/set-selector";
import notFound from "/not_found.jpg";
import searching from "/searching.jpg";
import Collection from "./collection";

type ControllerOptions = {
    set: SetSelector,
    card: HTMLInputElement,
    language: HTMLSelectElement,
    preview: HTMLImageElement,
    add: HTMLButtonElement,
    remove: HTMLButtonElement
};

type Selection = {
    setCode: string,
    collectorNumber: number,
    languageCode: string,
    isFoil: boolean
};

export default class Controller {
    private collection: Collection;
    private setInput: SetSelector;
    private collectorInput: HTMLInputElement;
    private languageSelector: HTMLSelectElement;
    private preview: HTMLImageElement;
    private add: HTMLButtonElement;
    private remove: HTMLButtonElement;

    public constructor(options: ControllerOptions) {
        this.collection = Collection.fromLocalStorage();
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
            this.cardFetcherWithFallBack(selection);
        }
    }

    private addCardListener(event: MouseEvent | KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const selection = this.getValidSelection(event);
        if(selection != null) {
            this.collection.add(selection);
        }
    }

    private removeCardListener(event: MouseEvent | KeyboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const selection = this.getValidSelection(event);
        if(selection != null) {
            this.collection.remove(selection);
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

    private cardFetcherWithFallBack(selection: Selection) {
        this.cardFetcher(selection)
        .catch(() => this.cardFetcher({...selection, languageCode: "en"}))
        .catch(() => this.cardFetcher({...selection, languageCode: "ph"}))
        .catch(() => this.preview.src = notFound);
    }

    private async cardFetcher(selection: Selection) {
        this.preview.src = searching;

        const card = await Scry.Cards.bySet(selection.setCode, selection.collectorNumber, selection.languageCode);
        this.preview.src = card.card_faces[0].image_uris?.large || "";
        this.collectorInput.focus();
        this.collectorInput.select();
    }

    public static mount(options: ControllerOptions): Controller {
        const fetcher = new Controller(options);
        fetcher.attach();
        return fetcher;
    }
}