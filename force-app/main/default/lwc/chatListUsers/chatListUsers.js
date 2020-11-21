import { LightningElement } from "lwc";

export default class ChatListUsers extends LightningElement {
  get fakeList() {
    return [
      { name: "Marcio", inicial: "MA" },
      { name: "Joaquim", inicial: "JO" },
      { name: "Alice", inicial: "AL" },
      { name: "Renato", inicial: "RE" },
      { name: "Beatriz", inicial: "BE" },
      { name: "Marcos", inicial: "MA" },
      { name: "Afonso", inicial: "AF" }
    ];
  }
}
