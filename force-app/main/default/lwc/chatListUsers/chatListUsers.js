import { LightningElement, track, api } from "lwc";
import getConversation from "@salesforce/apex/chatController.getChats";
export default class ChatListUsers extends LightningElement {
  @track chats = [];
  @track allConversations = [];

  connectedCallback() {
    this.getChats();
  }

  @api
  getChats() {
    getConversation()
      .then((result) => {
        this.allConversations = result;
        this.formatListChat();
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
  }

  formatAlias(listUsers) {
    let users = [];
    listUsers.forEach((element) => {
      let alias;
      if (element.Name.length > 2) {
        alias = element.Name.substr(0, 2);
      }
      element.Alias = alias.toUpperCase();
      users.push(element);
    });
    return users;
  }

  formatListChat() {
    let chats = [];

    this.allConversations.forEach((element) => {
      let isChat = element.Chats__r ? true : false;
      let name = element.Name;

      if (isChat && element.Chats__r.length === 1) {
        name = element.Chats__r[0].User__r.Name;
      }

      let obj = {
        Id: element.Id,
        Name: name,
        isChat: isChat
      };

      chats.push(obj);
    });

    chats = this.formatAlias(chats);

    this.chats = chats;
  }

  sendId(chatId) {
    let userId;
    let chat;

    this.chats.forEach((element) => {
      if (element.Id === chatId) {
        chat = element;
      }
    });

    if (
      chat == null ||
      !this.allConversations ||
      this.allConversations.length === 0
    ) {
      userId = chatId;
      chatId = null;
    }

    let value = { chatId: chatId, userId: userId };
    let message = new CustomEvent("selectuser", { detail: value });
    this.dispatchEvent(message);
  }
}
