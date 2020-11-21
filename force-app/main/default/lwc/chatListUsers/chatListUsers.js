import { LightningElement } from "lwc";

export default class ChatListUsers extends LightningElement {
  get fakeList() {
    return [
      { name: "Marcio", inicial: "MA" },
      { name: "Jander", inicial: "JA" },
      { name: "Alice", inicial: "AL" },
      { name: "Renato", inicial: "RE" },
      { name: "Beatriz", inicial: "BE" },
      { name: "Marcos", inicial: "MA" },
      { name: "Afonso", inicial: "AF" },
      { name: "Pedro", inicial: "PE" },
      { name: "Mulan", inicial: "MU" },
      { name: "Gisele", inicial: "GI" }
    ];
  }
}
