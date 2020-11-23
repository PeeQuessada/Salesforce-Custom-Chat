import { LightningElement, track, wire } from "lwc";
import getConversation from "@salesforce/apex/chatController.getChats";
import { publish, MessageContext } from "lightning/messageService";
import SEND_USER from "@salesforce/messageChannel/sendUser__c";
export default class ChatListUsers extends LightningElement {
  @wire(MessageContext) messageContext;
  @track chats = [];
  @track allConversations = [];

  connectedCallback() {
    this.getChats();
  }

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
    console.log("chats", this.allConversations);
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

    if (chat == null) {
      userId = chatId;
      chatId = null;
    }

    const record = { recordData: { chatId: chatId, userId: userId } };
    publish(this.messageContext, SEND_USER, record);
  }
}
