import { Inject, Injectable } from '@angular/core';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { WebSocketSubject } from 'rxjs/webSocket';
import { BackendService, CodeDetails, BackendMessage } from '../backend/backend.service';
import { Subject } from "rxjs";

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
  public messages: Map<string, Message[]> = new Map();
  public recievedMessageOn: Subject<string> = new Subject<string>();

  public get codeDetails(): CodeDetails | undefined {
    if (this.#codeDetails) {
      return { ...this.#codeDetails }
    }
    return undefined
  }

  constructor(private backend: BackendService) { 
    this.#codeDetails = this.loadCodeDetails();
  }

  private recvMessage = (val: BackendMessage) => {
    let msg: Message;
    if (val.sent_from === this.#codeDetails?.nextNumber) {
      msg = {
        content: val.message_text,
        timestamp: new Date(), // pretend the message was sent now
        with: val.sent_to,
        writtenBy: "US"
      }
    } else if (val.sent_to === this.#codeDetails?.nextNumber) {
      msg = {
        content: val.message_text,
        timestamp: new Date(),
        with: val.sent_from,
        writtenBy: "THEM"
      }
    } else {
      console.error(val);
      throw new Error("recieved a message that was neither from us nor for us??");
    }

    this.recievedMessageOn.next(msg.with);

    const mapEntry = this.messages.get(msg.with);
    if (mapEntry) {
      mapEntry.push(msg);
    } else {
      this.messages.set(msg.with, [msg]);
    }
  };

  private async initWsConnection() {
    if (this.#codeDetails == null) {
      throw new Error("trying to init ws connection while unauthenticated")
    }
    this.#wsConnection = this.backend.connectToWebsocketWithCode(this.#codeDetails?.accessCode)
    this.#wsConnection.subscribe({
      error: (e) => console.error(e),
      complete: () => console.warn("disconnected from websocket!"),
      next: this.recvMessage
    });
  }

  private saveCodeToLocalStorage() {
    localStorage.setItem("code", JSON.stringify(this.#codeDetails));
  }

  private loadCodeDetails(): CodeDetails | undefined {
    const maybeCode = localStorage.getItem("code");
    if (maybeCode) {
      const codeDetails: {
        accessCode: string
        nextNumber: string
        validUntil: string
      } = JSON.parse(maybeCode)
      const validUntilDate: Date = new Date(codeDetails.validUntil);
      if (Date.now() <= validUntilDate.valueOf()) {
        return {
          accessCode: codeDetails.accessCode,
          nextNumber: codeDetails.nextNumber,
          validUntil: validUntilDate
        }
      }
    }

    return undefined;
  }

  public async getNewPhoneNum() {
    this.#codeDetails = await this.backend.getNewCode();
    this.saveCodeToLocalStorage();
    await this.initWsConnection();
  }

  public async useExistingCode(code: string) {
    const { messages, ...codeDetails } = await this.backend.useExistingCode(code)
    this.#codeDetails = codeDetails;
    this.saveCodeToLocalStorage();

    for (const message of messages) {
      this.recvMessage(message)
    }

    await this.initWsConnection();
  }

  public async endSession() {
    if (this.#codeDetails == null) {
      throw new Error("trying to end session, but we are already unauthenticated")
    }
    localStorage.removeItem("code");
    this.backend.endSession(this.#codeDetails.accessCode);
    this.#codeDetails = undefined;
  }

  public async sendMessage(msgRecipient: string, msgContent: string) {
    if (this.#wsConnection == null) {
      console.log("are we authenticated? ");
      console.log(this.#codeDetails != null);
      throw new Error("trying to send message, but we are not connected");
    }

    // shush ur mouth typescript
    this.#wsConnection.next({ to: msgRecipient, body: msgContent } as any as BackendMessage)
    this.messages.get(msgRecipient)!.push({
      content: msgContent,
      writtenBy: "US",
      with: msgRecipient,
      timestamp: new Date()
    })
  }

}
