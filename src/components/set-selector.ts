import { BlockyForm } from "./blocky";
import * as Scry from "scryfall-sdk";

export default class SetSelector extends BlockyForm {
    public constructor() {
        super();

        this.template.appendChild(this.createReferencedElement("select", SetSelector.selectorReferenceName, {
            disabled: true
        }));

        this.generateOptions();        
    }

    public attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null): void {
        if(name === SetSelector.requiredAttributeName) {
            this.selector.required = JSON.parse(newVal?.toLowerCase() || "false");
        }
        else if(name === SetSelector.valueAttributeName) {
            this.selector.value = newVal || "";
        }
    }

    public checkValidity() : boolean {
        return this.selector.checkValidity();
    }

    public reportValidity() : boolean {
        return this.selector.reportValidity();
    }

    public setCustomValidity(error: string) {
        this.selector.setCustomValidity(error);
    }

    public get value() : string {
        return this.selector.value;
    }

    public set value(value: string) {
        this.selector.value = value;
    }

    public get required() : boolean {
        return this.selector.required;
    }

    public set required(value: boolean) {
        this.selector.required = value;
    }

    protected get selector() : HTMLSelectElement {
        return this.reference<HTMLSelectElement>(SetSelector.selectorReferenceName)!;
    }

    private generateOptions() {
        this.selector.appendChild(this.createElement("option", {
            value: "",
            selected: true,
            innerText: "Loading..."
        }));

        Scry.Sets.all().then(sets => {
            this.selector.innerHTML = "";

            for(const set of sets.sort((left, right) => new Date(right.released_at || "").getTime() - new Date(left.released_at || "").getTime())) {
                this.selector.appendChild(this.createElement("option", {
                    value: set.code,
                    innerHTML: `${set.code.toUpperCase()} - ${set.name}`
                }));
            }

            this.selector.disabled = false;
        });
    }

    private static readonly selectorReferenceName = "selector";
    private static readonly requiredAttributeName = "required";
    private static readonly valueAttributeName = "value";

    public static get observedAttributes(): string[] {
        return [ SetSelector.requiredAttributeName, SetSelector.valueAttributeName ];
    }
}

customElements.define("set-selector", SetSelector);