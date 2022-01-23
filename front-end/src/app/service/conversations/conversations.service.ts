import { Inject, Injectable } from '@angular/core';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { timeStamp } from 'console';
import { WebSocketSubject } from 'rxjs/webSocket';
import { BackendService, CodeDetails, BackendMessage } from '../backend/backend.service';

export interface Message {
  // the phone number of the person we are texting with
  with: string
  writtenBy: "US" | "THEM"
  content: string
  timestamp: Date
}

@Injectable({
  providedIn: 'root'
})
export class ConversationsService {

  #codeDetails?: CodeDetails;
  #wsConnection?: WebSocketSubject<BackendMessage>;

  // TODO: should this be a behaviorsubject?
  #messages: Map<string, Message[]> = new Map();

  public get codeDetails(): CodeDetails | undefined {
    if (this.#codeDetails) {
      return { ...this.#codeDetails }
    }
    return undefined
  }

  constructor(private backend: BackendService) { }

  private async initWsConnection() {
    if (this.#codeDetails == null) {
      throw new Error("trying to init ws connection while unauthenticated")
    }
    this.#wsConnection = this.backend.connectToWebsocketWithCode(this.#codeDetails?.accessCode)
    this.#wsConnection.subscribe({
      error: (e) => console.error(e),
      complete: () => console.warn("disconnected from websocket!"),
      next: (val) => {
        // TODO: fix based on ryan's websocket schema
        let msg: Message;
        if (val.from === this.#codeDetails?.nextNumber) {
          msg = {
            content: val.content,
            timestamp: new Date(val.timestamp),
            with: val.to,
            writtenBy: "US"
          }
        } else if (val.to === this.#codeDetails?.nextNumber) {
          msg = {
            content: val.content,
            timestamp: new Date(val.timestamp),
            with: val.from,
            writtenBy: "THEM"
          }
        } else {
          console.error(val);
          throw new Error("recieved a message that was neither from us nor for us??");
        }

        const mapEntry = this.#messages.get(msg.with);
        if (mapEntry) {
          mapEntry.push(msg);
        } else {
          this.#messages.set(msg.with, [msg]);
        }
      }
    });
  }

  public async getNewPhoneNum() {
    this.#codeDetails = await this.backend.getNewCode();
    this.initWsConnection();
  }

  public async useExistingCode(code: string) {
    const { messages, ...codeDetails } = await this.backend.useExistingCode(code)
    this.#codeDetails = codeDetails;
    this.initWsConnection();
    // TODO: put messages into #messages
  }

  public async endSession() {
    if (this.#codeDetails == null) {
      throw new Error("trying to end session, but we are already unauthenticated")
    }
    this.backend.endSession(this.#codeDetails.accessCode);
  }

  public async sendMessage(msgRecipient: string, msgContent: string) {
    if (this.#wsConnection == null) {
      console.log("are we authenticated? ");
      console.log(this.#codeDetails != null);
      throw new Error("trying to send message, but we are not connected");
    }

    // TODO: update based on what ryan sets the field names to
    this.#wsConnection.next({ msgRecipient, msgContent })
  }

}
