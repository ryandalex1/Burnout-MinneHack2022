import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConversationsService } from 'src/app/service/conversations/conversations.service';

export interface TextMessage {
  from: "US" | "THEM"
  contents: string
  timestamp: number
}


@Component({
  selector: 'app-conversations-page',
  templateUrl: './conversations-page.component.html',
  styleUrls: ['./conversations-page.component.scss']
})
export class ConversationsPageComponent implements OnInit {

  @Input() recipient!: string = "(555) 555-5555";

  messageToSend: string = "";

  textMessages: TextMessage[] = [
    {
      from: "US",
      contents: "What's up gamer?",
      timestamp: Date.now()
    },
    {
      from: "THEM",
      contents: "Not much, hbu?",
      timestamp: Date.now()
    },

  ]

  constructor(private conversations: ConversationsService) { }

  ngOnInit(): void {
  }

  sendMessageOnEnter(event: Event): boolean {
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

  sendMessage(): void {
    if (this.messageToSend != "") {
      this.textMessages.push({
        from: "US",
        contents: this.messageToSend,
        timestamp: Date.now()
      });
      this.conversations.sendMessage(this.recipient, this.messageToSend);
      this.messageToSend = "";
    }
  }

}
