import { LightningElement, track, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import getConversation from "@salesforce/apex/chatController.getConversation";
import insertMessage from "@salesforce/apex/chatController.createMessage";
import { subscribe, MessageContext } from "lightning/messageService";
import SEND_USER from "@salesforce/messageChannel/sendUser__c";

export default class ChatConversation extends LightningElement {
  @track messages;
  @track chat;
  @track userChat;

  @track chatId;
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
      this.chatId = data.recordData;
      console.log("chatId ", data.recordData);
    });
  }

  @wire(getConversation, { chatId: "$chatId" })
  wiredGetConversation({ error, data }) {
    if (data) {
      console.log("data ", data);
      this.chat = data.chat;
      this.messages = this.formatMessages(data.messages, data.userId);
      this.userChat = data.userChat;
    } else if (error) {
      this.chat = null;
      this.chat = null;
      this.userChat = null;
      console.log("error chat ", error);
    }
  }

  sendMessage() {
    let input = this.template.querySelector("input");
    console.log("message ", input.value);

    insertMessage({
      toUserId: this.user.Id,
      chatId: this.chatId,
      message: input.value
    })
      .then((result) => {
        console.log("sucesso", result);
        input.setAttribute("value", "");
        this.chatId = result;
        refreshApex(this.wiredGetConversation);
      })
      .catch((error) => {
        console.log("error ", error);
      });
  }

  formatMessages(messages, userId) {
    let listAux = [];
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
    return listAux;
  }
}
