import { LightningElement, track, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import SEND_USER from "@salesforce/messageChannel/sendUser__c";
export default class ChatListUsers extends LightningElement {
  @wire(MessageContext) messageContext;
  @track users = [];

  searchUser(event) {
    let error = event.detail.error;
    this.users = error ? [] : this.formatAlias(event.detail.users);
  }

  selectedUser(event) {
    console.log("click");
    let userId = event.currentTarget.dataset.user;
    this.sendUser(userId);
    this.template.querySelector("c-chat-search-user").cleanValue();
    console.log("end ");
  }

  formatAlias(listUsers) {
    let users = [];
    listUsers.forEach((element) => {
      let alias = element.Alias.split("");
      if (alias.length > 2) {
        element.Alias = element.Alias.substr(0, 2);
      }
      element.Alias = element.Alias.toUpperCase();
      users.push(element);
    });
    return users;
  }

  sendUser(userId) {
    let user;
    this.users.forEach((element) => {
      if (element.Id === userId) {
        user = element;
      }
    });
    // this.dispatchEvent(new CustomEvent('selected', { detail: userId}));
    const record = { recordData: user };
    publish(this.messageContext, SEND_USER, record);
    console.log("sended ");
  }
}
