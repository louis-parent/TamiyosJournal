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

	<div id="popup">Loading bulk data complete</div>

	<div id="data-menu">
		<button id="import" class="column at-center">Import bulk data</button>
	</div>
  
  <main class="row from-center wrap full-width bottom-margin-midrange">
    <aside class="column from-center padding-near">
	  <button id="change-mode">Extension → Alphabetical</button>

	  <div class="mode" id="extension" style="display: flex;">
		<set-selector id="set" class="bottom-margin-near"></set-selector>
      </div>
	  <div class="mode" id="alphabetical" style="display: none;">
		<div>Start at:</div>
		<input id="alphabeticalStart" class="bottom-margin-near" type="text" min="1" step="1"/>
      </div>

		<select id="language" class="bottom-margin-near" required>
			<option value="en">English 🇺🇸</option>
			<option value="fr" selected>French 🇫🇷</option>
			<option value="ph">Phyrexian ☠️</option>
		</select>

		<input id="card" class="bottom-margin-far" type="text" required placeholder="Collector number" />
      <div class="card info">
        Keyboard shortcut when in collector number field :
        <ul>
          <li><code>⏎ Enter</code> : Select a card</li>
          <li><code>➕</code> : Select and add a card</li>
          <li><code>➖</code> : Select and remove a card</li>
          <li><code>⇧ Shift</code> + <code>➕</code> : Select and add a card as foil</li>
          <li><code>⇧ Shift</code> + <code>➖</code> : Select and remove a card as foil</li>
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

  <button id="export" class="bottom-margin-near">Export collection</button>
  <collection-tree id="tree" class="full-width"></collection-tree>
`;

setTimeout(async () => {
	const tree: CollectionTree = document.querySelector("#tree")!;
	tree.data = await Collection.fromLocalStorage().asObject();

	const controller = Controller.mount({
		set: document.querySelector("#set")!,
		card: document.querySelector("#card")!,
		language: document.querySelector("#language")!,
		preview: document.querySelector("#preview")!,
		add: document.querySelector("#add")!,
		remove: document.querySelector("#remove")!,
		mode: document.querySelector("#change-mode")!,
		alphabeticalStart: document.querySelector("#alphabeticalStart")!,
		export: document.querySelector("#export")!,
		import: document.querySelector("#import")!
	});

	controller.addEventListener("changed", async collection => {
		tree.data = await collection.asObject();
	});
});