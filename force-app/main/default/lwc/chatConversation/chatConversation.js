import { LightningElement, track, wire } from "lwc";
import getConversation from "@salesforce/apex/chatController.getConversation";
import { subscribe, MessageContext } from "lightning/messageService";
import SEND_USER from "@salesforce/messageChannel/sendUser__c";

export default class ChatConversation extends LightningElement {
  @track messages;
  @track chat;
  @track userChat;

  @track user;
  subscription = null;
  @wire(MessageContext) messageContext;

  connectedCallback() {
    this.handleSubscribe();
  }

  handleSubscribe() {
    if (this.subscription) {
      return;
    }
    this.subscription = subscribe(this.messageContext, SEND_USER, (user) => {
      this.user = user.recordData;
      console.log("user ", this.user);
    });
  }

  @wire(getConversation, { user: "$user" })
  wiredGetConversation({ error, data }) {
    if (data) {
      this.chat = data.chat;
      this.messages = data.messages;
      this.userChat = data.userChat;
    } else if (error) {
      this.chat = null;
      this.chat = null;
      this.userChat = null;
      console.log("error chat ", error);
    }
  }

  sendMessage() {}
}
