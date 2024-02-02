abstract class Blocky extends HTMLElement {
    template: ShadowRoot;
    scopedStyle: HTMLStyleElement;
    
    constructor() {
        super();
        this.template = this.attachShadow({ mode: "open" });
        this.scopedStyle = document.createElement("style");
        this.template.appendChild(this.scopedStyle);
    }

    connectedCallback() {}
    disconnectedCallback() {}
    adoptedCallback() {}

    // abstract static get observedAttributes(): string[];
    abstract attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) : void;
}

export default Blocky;