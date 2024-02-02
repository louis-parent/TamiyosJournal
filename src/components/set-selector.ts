import Blocky from "./blocky";
import * as Scry from "scryfall-sdk";

class SetSelector extends Blocky {
    selector: HTMLSelectElement;

    constructor() {
        super();

        this.selector = document.createElement("select");
        this.template.appendChild(this.selector);
        this.selector.disabled = true;
        
        const empty = document.createElement("option");
        empty.value = "";
        empty.innerText = "Loading...";
        empty.selected = true;
        this.selector.appendChild(empty);

        Scry.Sets.all().then(sets => {
            this.selector.innerHTML = "";

            for(const set of sets.sort((left, right) => new Date(right.released_at || "").getTime() - new Date(left.released_at || "").getTime())) {
                const option = document.createElement("option");
                option.value = set.code;
                option.innerHTML = `${set.code.toUpperCase()} - ${set.name}`;
                this.selector.appendChild(option);
            }

            this.selector.disabled = false;
        });
    }

    attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null): void {
        if(name === SetSelector.requiredAttributeName) {
            this.selector.required = JSON.parse(newVal?.toLowerCase() || "false");
        }
        else if(name === SetSelector.valueAttributeName) {
            this.selector.value = newVal || "";
        }
    }

    checkValidity() : boolean {
        return this.selector.checkValidity();
    }

    reportValidity() : boolean {
        return this.selector.reportValidity();
    }

    setCustomValidity(error: string) {
        this.selector.setCustomValidity(error);
    }

    get value() : string {
        return this.selector.value;
    }

    set value(value: string) {
        this.selector.value = value;
    }

    get required() : boolean {
        return this.selector.required;
    }

    set required(value: boolean) {
        this.selector.required = value;
    }

    static readonly requiredAttributeName = "required";
    static readonly valueAttributeName = "value";
    static get observedAttributes(): string[] {
        return [ SetSelector.requiredAttributeName, SetSelector.valueAttributeName ];
    }
}

customElements.define("set-selector", SetSelector);
export default SetSelector;