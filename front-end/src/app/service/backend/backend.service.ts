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

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  public async getNewCode(): Promise<CodeDetails> {
    interface CreateSessionResponse {
      access_code: string
      next_number: string
      valid_until_time: number
    }

    const res = await firstValueFrom(this.http.post<CreateSessionResponse>(`${apiUrl}/create-session/`, {}));
    return {
      accessCode: res.access_code,
      nextNumber: res.next_number,
      validUntil: new Date(res.valid_until_time * 1000)
    }
  }

  public async useExistingCode(existingCode: string): Promise<CodeDetails> {
    interface ExistingSessionResponse {
      access_code: string
      next_number: string
      valid_until_time: number
    }

    const res = await firstValueFrom(this.http.get<ExistingSessionResponse>(`${apiUrl}/${existingCode}/`));
    return {
      accessCode: existingCode,
      nextNumber: res.next_number,
      validUntil: new Date(res.valid_until_time * 1000)
    }
  }

  public async endSession(): Promise<void> {
    await firstValueFrom(this.http.delete(`${apiUrl}/end/`))
  }

  private connectToWebsocket(): WebSocketSubject<unknown> { // TODO: this should be known
    return webSocket({
      url: `${apiUrl}/ws/` // TODO: this should be 
    })
  }
}
