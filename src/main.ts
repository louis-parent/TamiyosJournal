import "./styles/style.css"
import "./components/set-selector";
import "./components/collection-tree"

import CollectionTree from "./components/collection-tree";
import Controller from "./utils/controller";
import Collection from "./utils/collection";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Tamiyos' Journal</h1>
  
  <div class="row gapped full-width">
    <div class="column">
      <set-selector id="set"></set-selector>
      <input id="card" type="number" min="1" step="1" required placeholder="Collector number" />
      <select id="language" required>
        <option value="en" selected>🇺🇸 English</option>
        <option value="fr">🇫🇷 French</option>
        <option value="ph">Phyrexian</option>
      </select>
    </div>
    
    <div class="column">
      <img id="preview" class="quarter-screen-width" />

      <div class="row spaced full-width bottom-margin-midrange">
        <button id="add">➕</button>
        <button id="remove">➖</button>
      </div>
    </div>
  </div>

  <collection-tree id="tree" class="full-width"></collection-tree>
`;

setTimeout(() => {
  const tree : CollectionTree = document.querySelector("#tree")!;
  tree.data = Collection.fromLocalStorage().asObject();
  
  const controller = Controller.mount({
    set: document.querySelector("#set")!,
    card: document.querySelector("#card")!,
    language: document.querySelector("#language")!,
    preview: document.querySelector("#preview")!,
    add: document.querySelector("#add")!,
    remove: document.querySelector("#remove")!
  });
  
  controller.addEventListener("changed", collection => {
    tree.data = collection.asObject();
  });

})