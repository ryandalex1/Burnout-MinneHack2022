import { Component, OnInit } from '@angular/core';

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

}
