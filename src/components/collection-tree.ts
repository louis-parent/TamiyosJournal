import * as Scry from "scryfall-sdk";
import { getFlagByCode } from "../utils/language";
import Tree from "./tree";

export default class CollectionTree extends Tree {
    public constructor() {
        super();

        this.scopedStyle.insertRule(".set-heading { display: flex; flex-direction: row; align-items: center; }");
        this.scopedStyle.insertRule(".set-icon { margin-right: 0.5em; }");
        this.scopedStyle.insertRule(".leaf-item:first-child::after { content: '/'; margin-left: 0.5em; margin-right: 0.5em; }");
        this.scopedStyle.insertRule(".leaf { display: flex; flex-direction: row; }");
    }

    protected createNode(label: string, level: number): HTMLElement {
        if(level === 1) {
            return this.createLanguageNode(label);
        }
        else if(level === 2) {
            return this.createSetNode(label);
        }
        else if(level === 3) {
            return this.createCollectorNumberNode(parseInt(label));
        }
        else {
            return this.createElement("span");
        }
    }

    private createLanguageNode(languageCode: string) : HTMLElement {
        return this.createElement("span", {
            innerText: `${getFlagByCode(languageCode === "en" ? "us" : languageCode)} ${languageCode}`
        });
    }

    private createSetNode(setCode: string) : HTMLElement {
        const node = this.createElement("span", {
            class: "set-heading",
            innerText: setCode.toUpperCase()
        });

        Scry.Sets.byCode(setCode).then(set => {
            node.innerHTML = "";
            node.appendChild(this.createElement("img", {
                class: "set-icon",
                width: 24,
                height: 24,
                src: set.icon_svg_uri
            }));
            node.appendChild(this.createText(set.name));
        });

        return node;
    }

    private createCollectorNumberNode(collectorNumber: number) : HTMLElement {
        return this.createElement("span", {
            innerText: `Card n°${collectorNumber}`
        });
    }

    protected createLeaf(label: string, value: any, _level: number): HTMLElement {
        return this.createElement("span", {
            innerText: `${label === "foil" ? "🌟" : "🎴"} : ${value}`
        });
    }

    protected createClosedHeadingIndicator(): HTMLElement {
        return this.createElement("span", {
            innerText: "ᐅ"
        });
    }
    protected createOpenedHeadingIndicator(): HTMLElement {
        return this.createElement("span", {
            innerText: "ᐁ"
        });
    }
}

customElements.define("collection-tree", CollectionTree);