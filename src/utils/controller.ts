import * as Scry from "scryfall-sdk";
import SetSelector from "../components/set-selector";
import notFound from "/not_found.jpg";
import searching from "/searching.jpg";

type ControllerOptions = {
    set: SetSelector,
    card: HTMLInputElement,
    language: HTMLSelectElement,
    preview: HTMLImageElement
};

class Controller {
    setInput: SetSelector;
    collectorInput: HTMLInputElement;
    languageSelector: HTMLSelectElement;
    preview: HTMLImageElement;

    constructor(options: ControllerOptions) {
        this.setInput = options.set;
        this.collectorInput = options.card;
        this.languageSelector = options.language;
        this.preview = options.preview;
    }

    attach() {
        this.collectorInput.addEventListener("keypress", event => this.inputListener(event));
    }

    inputListener(event: KeyboardEvent) {
        if(event.key === "Enter") {
            const setCode = this.setInput.value;
            const collectorNumber = parseInt(this.collectorInput.value);
            const language = this.languageSelector.value;
            
            if(setCode.length > 0) {
                if(collectorNumber > 0) {
                    if(language.length > 0) {
                        this.cardFetcherWithFallBack(setCode, collectorNumber, language);
                    }
                    else {
                        this.languageSelector.reportValidity();
                    }
                }
                else {
                    this.collectorInput.reportValidity();
                }
            }
            else {
                this.setInput.reportValidity();
            }
        }
    }

    cardFetcherWithFallBack(set: string, cardNumber: number, language: string) {
        this.cardFetcher(set, cardNumber, language)
        .catch(() => this.cardFetcher(set, cardNumber, "en"))
        .catch(() => this.cardFetcher(set, cardNumber, "ph"))
        .catch(() => this.preview.src = notFound);
    }

    async cardFetcher(set: string, cardNumber: number, language: string) {
        this.preview.src = searching;

        const card = await Scry.Cards.bySet(set, cardNumber, language);
        this.preview.src = card.card_faces[0].image_uris?.large || "";
        this.collectorInput.focus();
        this.collectorInput.select();
    }

    static mount(options: ControllerOptions): Controller {
        const fetcher = new Controller(options);
        fetcher.attach();
        return fetcher;
    }
}

export default Controller;