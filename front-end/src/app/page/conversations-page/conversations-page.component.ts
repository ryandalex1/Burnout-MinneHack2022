import {Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ConversationsService} from 'src/app/service/conversations/conversations.service';
import {filter} from "rxjs";

export interface TextMessage {
  writtenBy: "US" | "THEM"
  content: string
  timestamp: Date
}


@Component({
  selector: 'app-conversations-page',
  templateUrl: './conversations-page.component.html',
  styleUrls: ['./conversations-page.component.scss']
})
export class ConversationsPageComponent implements OnInit {

  @Input() recipient: string = "";

  messageToSend: string = "";

  textMessages: TextMessage[] = [
    {
      writtenBy: "US",
      content: "What's up gamer?",
      timestamp: new Date()
    },
    {
      writtenBy: "THEM",
      content: "Not much, hbu?",
      timestamp: new Date()
    },

  ]

  // TODO Fix this
  constructor(private conversations: ConversationsService) {
    conversations.recievedMessageOn.pipe(
      filter((s) => s == this.recipient)
    ).subscribe(() => {
      setTimeout(() => {
          document.querySelector("#scrollToBottom")!.scrollIntoView();
        }, 100
      );
    })
  }

  ngOnInit(): void {
    let maybeMessages = this.conversations.messages.get(this.recipient);
    if (maybeMessages == null) {
      maybeMessages = []
      if (this.recipient != "") {
        this.conversations.messages.set(this.recipient, maybeMessages);
      }
    }
    this.textMessages = maybeMessages
    console.log(this.textMessages);
    setTimeout(() => {
        document.querySelector("#scrollToBottom")!.scrollIntoView();
      }, 100
    );
  }

  sendMessageOnEnter(event: Event): boolean {
    console.log(this.conversations.messages);
    const ke: KeyboardEvent = event as KeyboardEvent;
    if (ke.key === "Enter") {
      if (ke.shiftKey) {
        return true;
      } else {
        ke.preventDefault();
        this.sendMessage();
        return false;
      }
    }
    return true;
  }

  updateRecipient(recipient: string) {
    this.recipient = recipient;
    this.textMessages = this.conversations.messages.get(recipient)!;
  }

  sendMessage(): void {
    if (this.messageToSend != "") {
      // this.textMessages.push({
      //   writtenBy: "US",
      //   content: this.messageToSend,
      //   timestamp: new Date()
      // });
      this.conversations.sendMessage(this.recipient, this.messageToSend);
      this.messageToSend = "";

      setTimeout(() => {
          document.querySelector("#scrollToBottom")!.scrollIntoView();
        }, 100
      );
    }
  }
}
