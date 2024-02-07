import { Blocky } from "./blocky";

export default abstract class Tree extends Blocky {
    private static readonly dataAttribute = "data";
    private static readonly expandedAttribute = "expanded";
    private static readonly persistAttribute = "persist";

    private openedBranches : Map<number, Set<string>> = new Map();

    public constructor() {
        super();

        // Minimal style
        this.scopedStyle.insertRule(":root, .node { display: flex; flex-direction: column; }");
        this.scopedStyle.insertRule(".node-heading { display: flex; flex-direction: row; }");
        this.scopedStyle.insertRule(".node-heading-label { margin-left: 1em; }");

        // Interaction
        this.scopedStyle.insertRule(".node-heading { cursor: pointer; }");
        this.scopedStyle.insertRule(".node.closed > :not(:first-child) { display: none; }");
        this.scopedStyle.insertRule(".node.closed > .node-heading > .node-heading-opened-indicator { display: none; }");
        this.scopedStyle.insertRule(".node:not(.closed) > .node-heading > .node-heading-closed-indicator { display: none; }");

        this.refresh();
    }

    public attributeChangedCallback(name: string, _oldVal: string | null, _newVal: string | null): void {
        if(name === Tree.dataAttribute) {
            this.refresh();
        }
        else if(name === Tree.expandedAttribute && this.expanded) {
            for(const node of this.template.querySelectorAll(".node")) {
                node.classList.remove("closed");
            }
        }
    }

    public get data() : any {
        return JSON.parse(this.getAttribute(Tree.dataAttribute) || "{}");
    }

    public set data(value: any) {
        this.setAttribute(Tree.dataAttribute, JSON.stringify(value));
    }

    public get expanded() : boolean {
        return JSON.parse(this.getAttribute(Tree.expandedAttribute) || "false") || false;
    }

    public set expanded(value: boolean) {
        this.setAttribute(Tree.expandedAttribute, JSON.stringify(value));
    }

    public get persist() : boolean {
        return JSON.parse(this.getAttribute(Tree.persistAttribute) || "true");
    }

    public set persist(value: boolean) {
        this.setAttribute(Tree.persistAttribute, JSON.stringify(value));
    }

    public refresh() {
        this.template.innerHTML = "";
        this.createTree(this.template, this.data, 1);
    }

    private createTree(parent: Node, data: any, depth: number) {
        const leafs = new Array<string>();

        for(const label in data) {
            if(typeof data[label] === "object") {
                const mustBeOpen = this.expanded || (this.persist && this.openedBranches.get(depth)?.has(label));

                const node = this.createElement("div", {
                    class: `node ${mustBeOpen ? "" : "closed"}`,
                    style: `margin-left: ${depth}%`
                });
                
                const heading = this.createHeading(label, depth);
                heading.addEventListener("click", () => this.toggleBranch(node, label, depth));
                node.appendChild(heading); 
                
                this.createTree(node, data[label], depth+1);
                
                parent.appendChild(node);
            }
            else {
                leafs.push(label);
            }
        }

        parent.appendChild(this.createLeafs(leafs, data, depth));
    }

    private toggleBranch(node: HTMLElement, label: string, depth: number) {
        const isClosed = node.classList.toggle("closed");

        let branchOfDepth = this.openedBranches.get(depth);
        if(branchOfDepth === undefined) {
            branchOfDepth = new Set<string>();
            this.openedBranches.set(depth, branchOfDepth);
        }

        if(isClosed) {
            branchOfDepth.delete(label);
        }
        else {
            branchOfDepth.add(label);
        }
        
    }

    private createHeading(label: string, depth: number) : HTMLElement {
        const heading = this.createElement("div");
        heading.classList.add("node-heading");

        const closedIndicator = this.createClosedHeadingIndicator();
        closedIndicator.classList.add("node-heading-closed-indicator");
        heading.appendChild(closedIndicator);

        const openedIndicator = this.createOpenedHeadingIndicator();
        openedIndicator.classList.add("node-heading-opened-indicator");
        heading.appendChild(openedIndicator);

        const headingLabel = this.createNode(label, depth);
        headingLabel.classList.add("node-heading-label");
        heading.appendChild(headingLabel);

        return heading;
    }

    private createLeafs(leafs: Array<string>, data: any, depth: number) : HTMLElement {
        const node = this.createElement("div", {
            class: "leaf",
            style: `margin-left: ${depth+1}%`
        });

        for(const leaf of leafs) {
            const item = this.createLeaf(leaf, data[leaf], depth);
            item.classList.add("leaf-item");
            node.appendChild(item);
        }

        return node;
    }

    protected abstract createClosedHeadingIndicator() : HTMLElement;
    protected abstract createOpenedHeadingIndicator() : HTMLElement;
    protected abstract createNode(label: string, level: number) : HTMLElement;
    protected abstract createLeaf(label: string, value: any, level: number) : HTMLElement;

    public static get observedAttributes(): string[] { return [ Tree.dataAttribute, Tree.expandedAttribute, Tree.persistAttribute ]; }
}