import { LightningElement } from "lwc";
import USER_ID from "@salesforce/user/Id";
import { subscribe } from "lightning/empApi";

export default class ChatContainer extends LightningElement {
  channelName = "/event/Chat_Event__e";
  userId = USER_ID;
  subscription = {};

  connectedCallback() {
    this.handleSubscribe();
  }

  handleSubscribe() {
    // Callback invoked whenever a new event message is received
    const messageCallback = (response) => {
      let message = response.data.payload;
      if (message.CreatedById !== this.userId) {
        try {
          this.template.querySelector("c-chat-list-users").getChats();
          this.template
            .querySelector("c-chat-conversation")
            .insertNewMessage(message);
        } catch (error) {
          console.log("error save message ", error);
        }
      }
      // Response contains the payload of the new message received
    };

    // Invoke subscribe method of empApi. Pass reference to messageCallback
    subscribe(this.channelName, -1, messageCallback).then((response) => {
      // Response contains the subscription information on successful subscribe call
      console.log(
        "Successfully subscribed to : ",
        JSON.stringify(response.channel)
      );
      this.subscription = response;
    });
  }
}
