import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HueLightService {
  private readonly BRIDGE_IP = '192.168.0.3'; // Replace with your bridge IP
  private readonly API_KEY = 'accDyGkcUk0ZQhW5KU-ENr1Q83dgRqVJGoInANIO'; // Replace with your API key
  private readonly BASE_URL = `http://${this.BRIDGE_IP}/api/${this.API_KEY}`;

  constructor(private http: HttpClient) {}

  getLight(lightId: number): Observable<any> {
    return this.http
      .get(`${this.BASE_URL}/lights/${lightId}`)
      .pipe(catchError(this.handleError));
  }

  turnOn(lightId: number): Observable<any> {
    const payload = { on: true };
    return this.sendRequest('PUT', `/lights/${lightId}/state`, payload);
  }

  turnOff(lightId: number, fadeMs: number = 0): Observable<any> {
    const payload: any = { on: false };
    if (fadeMs === 0) {
      payload.transitiontime = 0;
    } else {
      payload.transitiontime = Math.round(fadeMs / 100); // Convert to deciseconds
    }
    return this.sendRequest('PUT', `/lights/${lightId}/state`, payload);
  }

  setColor(lightId: number, red: number, green: number, blue: number, fadeMs: number = 0): Observable<any> {
    const xy = this.calculateXY(red, green, blue);
    const payload: any = { on: true, xy };
    if (fadeMs === 0) {
      payload.transitiontime = 0;
    } else {
      payload.transitiontime = Math.round(fadeMs / 100); // Convert to deciseconds
    }
    return this.sendRequest('PUT', `/lights/${lightId}/state`, payload);
  }

  private sendRequest(method: string, endpoint: string, body: any = null): Observable<any> {
    const url = `${this.BASE_URL}${endpoint}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (method === 'GET') {
      return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    } else {
      return this.http
        .request(method, url, { body: JSON.stringify(body), headers })
        .pipe(catchError(this.handleError));
    }
  }

  private calculateXY(red: number, green: number, blue: number): number[] {
    let r = red / 255.0;
    let g = green / 255.0;
    let b = blue / 255.0;

    // Linearize RGB values
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    const x = r * 0.649926 + g * 0.103455 + b * 0.197109;
    const y = r * 0.234327 + g * 0.743075 + b * 0.022598;
    const z = r * 0.0 + g * 0.053077 + b * 1.035763;

    const sum = x + y + z;
    return [x / sum, y / sum];
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
}
