export abstract class Blocky extends HTMLElement {
    protected template: ShadowRoot;
    private references: Map<string, HTMLElement>;

    public constructor() {
        super();

        this.template = this.attachShadow({ mode: "open" });
        this.template.adoptedStyleSheets.push(new CSSStyleSheet());
        this.references = new Map();
    }

    public get scopedStyle() : CSSStyleSheet {
        return this.template.adoptedStyleSheets[0];
    }

    public connectedCallback() {}
    public disconnectedCallback() {}
    public adoptedCallback() {}

    public createReferencedElement<E extends HTMLElement>(tag: string, reference: string, defaults? : { [attribute: string]: any}) : E {
        const element = this.createElement<E>(tag, defaults);
        this.references.set(reference, element);
        return element;
    }

    public createElement<E extends HTMLElement>(tag: string, defaults? : { [attribute: string]: any}) : E {
        const element : E = document.createElement(tag) as E;

        if(defaults != undefined) {
            for(const key in defaults) {
                if(key === "innerHTML") {
                    element.innerHTML = defaults[key];
                }
                else if(key === "innerText") {
                    element.innerText = defaults[key];
                }
                else {
                    element.setAttribute(key, defaults[key])
                }
            }
        }

        return element;
    }

    public createText(text: string) : Text {
        return document.createTextNode(text);
    }

    public reference<E extends HTMLElement>(reference: string) : E | undefined {
        const element = this.references.get(reference) as E;
        if(element !== undefined) {
            return element as E;
        }
        else {
            return undefined;
        }
    }
    
    public abstract attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) : void;

    // public static get observedAttributes(): string[] { return []; }
}

export abstract class BlockyForm extends Blocky {
    public abstract checkValidity() : boolean;
    public abstract reportValidity() : boolean;
    public abstract setCustomValidity(error: string) : void;
}