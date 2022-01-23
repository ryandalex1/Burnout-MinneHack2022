import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';

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

  constructor() { }

  ngOnInit(): void {
  }

  sendMessageOnEnter(event: Event): void {
    if ((event as KeyboardEvent)?.key === "Enter") {
      this.sendMessage()
    }
  }

  sendMessage(): void {
    if (this.messageToSend != "") {
      this.textMessages.push({
        from: "US",
        contents: this.messageToSend,
        timestamp: Date.now()
      });
      this.messageToSend = "";
    }
  }

}
