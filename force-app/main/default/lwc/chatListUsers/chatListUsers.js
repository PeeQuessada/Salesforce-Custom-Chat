import { LightningElement, track, wire } from "lwc";
import getConversation from "@salesforce/apex/chatController.getChats";
import { publish, MessageContext } from "lightning/messageService";
import SEND_USER from "@salesforce/messageChannel/sendUser__c";
export default class ChatListUsers extends LightningElement {
  @wire(MessageContext) messageContext;
  @track chats = [];

  connectedCallback() {
    this.getChats();
  }

  getChats() {
    getConversation()
      .then((result) => {
        this.chats = result;
      })
      .catch((error) => {
        console.log("error init ", error);
      });
  }

  searchUser(event) {
    let error = event.detail.error;
    this.chats = error ? [] : this.formatAlias(event.detail.users);
  }

  selected(event) {
    console.log("click");
    let chatId = event.currentTarget.dataset.chat;
    this.sendId(chatId);
    this.template.querySelector("c-chat-search-user").cleanValue();
    this.getChats();
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

  sendId(chatId) {
    // this.dispatchEvent(new CustomEvent('selected', { detail: userId}));
    const record = { recordData: chatId };
    publish(this.messageContext, SEND_USER, record);
    console.log("sended ");
  }
}
