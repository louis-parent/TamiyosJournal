export abstract class Blocky extends HTMLElement {
    protected template: ShadowRoot;
    protected scopedStyle: HTMLStyleElement;
    
    public constructor() {
        super();

        this.template = this.attachShadow({ mode: "open" });

        this.scopedStyle = document.createElement("style");
        this.template.appendChild(this.scopedStyle);
    }

    public connectedCallback() {}
    public disconnectedCallback() {}
    public adoptedCallback() {}

    // abstract static get observedAttributes(): string[];
    public abstract attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) : void;
}

export abstract class BlockyForm extends Blocky {
    public abstract checkValidity() : boolean;
    public abstract reportValidity() : boolean;
    public abstract setCustomValidity(error: string) : void;
}