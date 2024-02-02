import * as Scry from "scryfall-sdk";
import SetSelector from "../components/set-selector";

type ControllerOptions = {
    set: SetSelector,
    card: HTMLInputElement,
    preview: HTMLImageElement
};

class Controller {
    setInput: SetSelector;
    collectorInput: HTMLInputElement;
    preview: HTMLImageElement;

    constructor(options: ControllerOptions) {
        this.setInput = options.set;
        this.collectorInput = options.card;
        this.preview = options.preview;
    }

    attach() {
        this.collectorInput.addEventListener("keypress", event => this.inputListener(event));
    }

    inputListener(event: KeyboardEvent) {
        if(event.key === "Enter") {
            const setCode = this.setInput.value;
            const collectorNumber = parseInt(this.collectorInput.value);
            
            if(setCode.length > 0) {
                if(collectorNumber > 0) {
                    this.cardFetcher(setCode, collectorNumber);
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

    cardFetcher(set: string, cardNumber: number) {
        Scry.Cards.bySet(set, cardNumber).then(card => {
            this.preview.src = card.card_faces[0].image_uris?.large || "";
            this.collectorInput.focus();
            this.collectorInput.select();
        });
    }

    static mount(options: ControllerOptions): Controller {
        const fetcher = new Controller(options);
        fetcher.attach();
        return fetcher;
    }
}

export default Controller;