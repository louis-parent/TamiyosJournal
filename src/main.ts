import "./styles/style.css"
import "./components/set-selector";
import Controller from "./utils/controller";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Tamiyos' Journal</h1>
  
  <div class="row spaced full-width bottom-margin-midrange">
    <div class="column at-start right-margin-near">
      <h2 class="no-margin">Card set :</h2>
      <set-selector id="set"></set-selector>
    </div>

    <div class="column at-start">
      <h2 class="no-margin">Card number :</h2>
      <input id="card" type="number" min="0" step="1" required />
    </div>
  </div>

  <div class="row spaced full-width bottom-margin-midrange">
    <button id="add">➕</button>
    <button id="remove">➖</button>
  </div>

  <img id="preview" class="third-width-max" />
`;

setTimeout(() => {
  Controller.mount({
    set: document.querySelector("#set")!,
    card: document.querySelector("#card")!,
    preview: document.querySelector("#preview")!
  });
})