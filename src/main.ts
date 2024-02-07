import "./styles/style.css";
import "./components/set-selector";
import "./components/collection-tree";

import icon from "/icon.svg";
import cardBack from "/card_back.png";
import CollectionTree from "./components/collection-tree";
import Controller from "./utils/controller";
import Collection from "./utils/collection";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1 class="row from-center at-center">
    <img src="${icon}" width="64" />
    <span>Tamiyos' Journal</span>
  </h1>
  
  <main class="row gapped full-width bottom-margin-midrange wrap">
    <aside class="column from-center padding-near">
      <set-selector id="set" class="bottom-margin-near"></set-selector>

      <select id="language" class="bottom-margin-near" required>
        <option value="en" selected>English 🇺🇸</option>
        <option value="fr">French 🇫🇷</option>
        <option value="ph">Phyrexian ☠️</option>
      </select>

      <input id="card" class="bottom-margin-far" type="number" min="1" step="1" required placeholder="Collector number" />

      <div class="card info">
        Keyboard shortcut when in collector number field :
        <ul>
          <li><code>➕</code> : Add the selected card</li>
          <li><code>➖</code> : Remove the selected card</li>
          <li><code>⇧ Shift</code> + <code>➕</code> : Add the selected card as foil</li>
          <li><code>⇧ Shift</code> + <code>➖</code> : Remove the selected card as foil</li>
        </ul>
      </div>
    </aside>
    
    <section class="column">
      <img id="preview" class="mtg-card bottom-margin-near" src="${cardBack}" />

      <div class="row spaced full-width">
        <button id="add">➕</button>
        <button id="remove">➖</button>
      </div>
    </section>
  </main>

  <collection-tree id="tree" class="full-width"></collection-tree>
`;

setTimeout(async () => {
  const tree : CollectionTree = document.querySelector("#tree")!;
  tree.data = await Collection.fromLocalStorage().asObject();
  
  const controller = Controller.mount({
    set: document.querySelector("#set")!,
    card: document.querySelector("#card")!,
    language: document.querySelector("#language")!,
    preview: document.querySelector("#preview")!,
    add: document.querySelector("#add")!,
    remove: document.querySelector("#remove")!
  });
  
  controller.addEventListener("changed", async collection => {
    tree.data = await collection.asObject();
  });
});