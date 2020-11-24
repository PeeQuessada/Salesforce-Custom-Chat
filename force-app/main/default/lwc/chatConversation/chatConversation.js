import { LightningElement, track, api } from "lwc";
import getConversation from "@salesforce/apex/chatController.getConversation";
import insertMessage from "@salesforce/apex/chatController.createMessage";

export default class ChatConversation extends LightningElement {
  @track messages = [];
  @track chat;
  @track userChat;

  @track value = "";

  @track chatId;
  @track userId;

  renderedCallback() {
    let element = this.template.querySelector(".slds-scrollable_y");
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }

  @api
  selectedChat(chatId, userId) {
    this.chatId = chatId;
    this.userId = userId;
    this.getConversation();
  }

  getConversation() {
    getConversation({ chatId: this.chatId })
      .then((result) => {
        console.log(" this.chatId ", this.chatId);
        console.log("data ", result);
        this.chat = result.chat;
        this.messages = this.formatMessages(result.messages, result.userId);
        this.userChat = result.userChat;
      })
      .catch((error) => {
        this.chat = null;
        this.chat = null;
        this.userChat = null;
        console.log("error to save message ", error);
      });
  }

  sendMessage() {
    let input = this.template.querySelector("input");

    insertMessage({
      toUserId: this.userId,
      chatId: this.chatId,
      message: input.value
    })
      .then((result) => {
        console.log("sucesso", result);
        this.value = "";
        this.template.querySelector("input").setAttribute("value", "");
        let newChat = !this.chatId && this.userId;
        this.chatId = result;
        if (newChat) {
          let initialChat = new CustomEvent("reloaded");
          this.dispatchEvent(initialChat);
        } else {
          let message = {
            Id: Math.random(),
            Message__c: input.value,
            Owner: true
          };
          this.messages.push(message);
        }
      })
      .catch((error) => {
        console.log("error insert ", error);
      });
  }

  formatMessages(messages, userId) {
    let listAux = [];

    if (messages && messages.length > 0) {
      messages.forEach((element) => {
        let owner = false;
        if (element.CreatedById === userId) {
          owner = true;
        }

        listAux.push({
          Id: element.Id,
          Message__c: element.Message__c,
          CreatedById: element.CreatedById,
          CreatedBy: { Name: element.CreatedBy.Name },
          CreatedDate: element.CreatedDate,
          Owner: owner
        });
      });
    }

    return listAux;
  }

  @api
  insertNewMessage(message) {
    if (this.chatId === message.ChatId__c) {
      message.Id = Math.random();
      this.messages.push(message);
    }
  }
}
