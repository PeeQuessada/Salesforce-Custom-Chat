import { LightningElement, track, wire } from "lwc";
import getConversation from "@salesforce/apex/chatController.getConversation";
import insertMessage from "@salesforce/apex/chatController.createMessage";
import { subscribe, MessageContext } from "lightning/messageService";
import SEND_USER from "@salesforce/messageChannel/sendUser__c";

export default class ChatConversation extends LightningElement {
  @track messages;
  @track chat;
  @track userChat;

  @track value = "";

  @track chatId;
  @track userId;
  subscription = null;
  @wire(MessageContext) messageContext;

  connectedCallback() {
    this.handleSubscribe();
  }

  handleSubscribe() {
    if (this.subscription) {
      return;
    }
    this.subscription = subscribe(this.messageContext, SEND_USER, (data) => {
      this.chatId = data.recordData.chatId;
      this.userId = data.recordData.userId;
      console.log("event received ", data.recordData);
      this.getConversation();
    });
  }

  getConversation() {
    getConversation({ chatId: this.chatId })
      .then((result) => {
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
        this.chatId = result;
        this.getConversation();
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
}
