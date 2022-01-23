import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

const { apiUrl } = environment;

export interface CodeDetails {
  accessCode: string
  nextNumber: string
  validUntil: Date
}

export interface BackendMessage {
  sent_from: string
  sent_to: string
  message_text: string
}

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  public async getNewCode(): Promise<CodeDetails> {
    interface CreateSessionResponse {
      access_code: string
      assigned_phone_number: string
      valid_until_time: number
    }

    const res = await firstValueFrom(this.http.post<CreateSessionResponse>(`${apiUrl}/create-session/`, {}));
    return {
      accessCode: res.access_code,
      nextNumber: res.assigned_phone_number,
      validUntil: new Date(res.valid_until_time * 1000)
    }
  }

  public async useExistingCode(existingCode: string): Promise<CodeDetails & { messages: BackendMessage[] }> {
    interface ExistingSessionResponse {
      session: {
        access_code: string,
        assigned_phone_number: string,
        valid_until_time: number
      }
      messages: BackendMessage[]
    }

    const res = await firstValueFrom(this.http.get<ExistingSessionResponse>(`${apiUrl}/${existingCode}/`));
    return {
      accessCode: res.session.access_code,
      nextNumber: res.session.assigned_phone_number,
      validUntil: new Date(res.session.valid_until_time * 1000),
      messages: res.messages
    }
  }

  public async endSession(user_id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${apiUrl}/end/`, { body: { user_id } }))
  }

  public connectToWebsocketWithCode(code: string): WebSocketSubject<BackendMessage> {
    return webSocket({
      url: `${apiUrl.replace('http', 'ws')}/ws/${code}`
    })
  }
}
