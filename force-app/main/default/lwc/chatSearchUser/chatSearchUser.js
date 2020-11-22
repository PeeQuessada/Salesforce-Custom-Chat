import { LightningElement, api } from "lwc";
import getUsers from "@salesforce/apex/chatController.getUsers";

export default class ChatSearchUser extends LightningElement {
  value = "";
  @api test;

  searchUser(event) {
    let value = event.target.value;
    this.value = value;

    if (!value || !value.split(" ")) {
      this.sendEvent([], null);
    }
    if (value) {
      getUsers({ name: value })
        .then((result) => {
          this.sendEvent(result, null);
        })
        .catch((error) => {
          this.sendEvent([], error);
        });
    }
  }

  sendEvent(users, error) {
    this.dispatchEvent(
      new CustomEvent("searchuser", {
        detail: {
          users: users,
          error: error
        }
      })
    );
  }

  @api
  cleanValue() {
    console.log("clean");
    this.value = "";
  }
}
