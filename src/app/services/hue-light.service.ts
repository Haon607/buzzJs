import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { forkJoin, Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HueLightService {
    private readonly BRIDGE_IP = '192.168.0.10'; // Replace with your bridge IP
    private readonly API_KEY = 'accDyGkcUk0ZQhW5KU-ENr1Q83dgRqVJGoInANIO'; // Replace with your API key
    private readonly BASE_URL = `http://${this.BRIDGE_IP}/api/${this.API_KEY}`;

    static primary = [1, 5, 7];
    static secondary = [2, 6, 8, 9, 10, 11];

    constructor(private http: HttpClient) {}

    getLights(lightIds: number[]): void {
        const requests = lightIds.map((lightId) =>
            this.http.get(`${this.BASE_URL}/lights/${lightId}`).pipe(catchError(this.handleError))
        );
        forkJoin(requests).subscribe({
            next: (responses) => console.log('Light states:', responses),
            error: (err) => console.error('Error fetching lights:', err),
        });
    }

    turnOn(lightIds: number[], fadeMs = 0): void {
        const payload: any = { on: true };
        payload.transitiontime = fadeMs === 0 ? 0 : Math.round(fadeMs / 100); // Convert to deciseconds
        this.sendRequests('PUT', lightIds, '/state', payload);
    }

    turnOff(lightIds: number[], fadeMs = 0): void {
        const payload: any = { on: false };
        payload.transitiontime = fadeMs === 0 ? 0 : Math.round(fadeMs / 100); // Convert to deciseconds
        this.sendRequests('PUT', lightIds, '/state', payload);
    }

    setColor(lightIds: number[], hexColor: string, fadeMs = 0, brightnessOverride?: number): void {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) {
            console.error('Invalid hex color provided:', hexColor);
            return;
        }

        // Calculate XY values
        const xy = this.calculateXY(rgb.red, rgb.green, rgb.blue);

        // Calculate brightness from luminance or use override if provided
        const brightness = brightnessOverride !== undefined
            ? Math.min(Math.max(brightnessOverride, 1), 254) // Clamp override to valid range
            : this.calculateBrightness(rgb.red, rgb.green, rgb.blue);

        // Prepare payload
        const payload: any = { on: true, xy, bri: brightness };
        payload.transitiontime = fadeMs === 0 ? 0 : Math.round(fadeMs / 100); // Convert to deciseconds

        // Send request
        this.sendRequests('PUT', lightIds, '/state', payload);
    }

    async bounceLight(lightIds: number[], firstBrightness = 50, secondBrightness = 254, timeInDeciSeconds = 10): Promise<void> {
        let payload: any = { bri: firstBrightness, transitiontime: timeInDeciSeconds};
        this.sendRequests('PUT', lightIds, '/state', payload);
        await new Promise(resolve => setTimeout(resolve, timeInDeciSeconds * 100));
        payload = { bri: secondBrightness, transitiontime: timeInDeciSeconds};
        this.sendRequests('PUT', lightIds, '/state', payload);
    }

    private sendRequests(method: string, lightIds: number[], endpoint: string, body: any = null): void {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const requests = lightIds.map((lightId) => {
            const url = `${this.BASE_URL}/lights/${lightId}${endpoint}`;
            return this.http.request(method, url, { body: JSON.stringify(body), headers }).pipe(catchError(this.handleError));
        });
        forkJoin(requests).subscribe({
            next: (/*responses*/) => {/*console.log(responses)*/},
            error: (err) => console.error('Error in requests:', err),
        });
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

    private calculateBrightness(red: number, green: number, blue: number): number {
        // Normalize RGB to [0, 1]
        const r = red / 255;
        const g = green / 255;
        const b = blue / 255;

        // Calculate relative luminance
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // Scale luminance to brightness range (1–254), enforce a minimum brightness threshold
        const brightness = Math.max(Math.round(luminance * 254), 20); // Ensure at least 20 brightness
        return brightness;
    }

    private hexToRgb(hex: string): { red: number; green: number; blue: number } | null {
        // Remove the hash if present
        hex = hex.replace(/^#/, '');

        if (hex.length === 3) {
            hex = hex.split('').map((char) => char + char).join('');
        }

        if (hex.length !== 6) {
            return null;
        }

        const bigint = parseInt(hex, 16);
        return {
            red: (bigint >> 16) & 255,
            green: (bigint >> 8) & 255,
            blue: bigint & 255,
        };
    }

    private handleError(error: any): Observable<never> {
        console.error('An error occurred:', error);
        return throwError('Something went wrong; please try again later.');
    }
}
