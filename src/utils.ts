export function styledLogger(message: string, style: Style): void {
    const styles = [
        'color: red; font-weight: bold;',
        'color: yellow; text-decoration: underline;',
        'color: green; font-family: monospace; font-style: italic;',
        'color: green; font-family: monospace; font-style: italic; font-weight: bold;',
    ];

    console.log(`%c${message}`, styles[style]);
}

export enum Style {
    speak,
    requiresInput,
    information,
    highlightInformation
}

export function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements at indices i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export class ColorFader {
    static getContrastColor(hexColor: string): string {
        // Remove the '#' if it's present
        const color = hexColor.replace(/^#/, '');

        // Parse r, g, b values
        const r = parseInt(color.slice(0, 2), 16) / 255;
        const g = parseInt(color.slice(2, 4), 16) / 255;
        const b = parseInt(color.slice(4, 6), 16) / 255;

        // Calculate the relative luminance
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // If luminance is greater than 0.5, return black; otherwise, return white
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    /**
     * Adjusts the brightness of a hex color by a given percentage.
     * @param hexColor - The hex color string (e.g., "#FF5733").
     * @param percent - The percentage to adjust brightness (-100 to 100).
     *                   Positive values increase brightness, negative decrease.
     * @returns The adjusted hex color string.
     */
    static adjustBrightness(hexColor: string, percent: number): string {
        // Ensure percent is clamped between -100 and 100
        percent = Math.max(-100, Math.min(100, percent));

        // Remove the "#" if present and parse the hex color into RGB components
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);

        // Adjust each color component by the percentage
        r = Math.min(255, Math.max(0, Math.round(r + (r * percent) / 100)));
        g = Math.min(255, Math.max(0, Math.round(g + (g * percent) / 100)));
        b = Math.min(255, Math.max(0, Math.round(b + (b * percent) / 100)));

        // Convert back to hex and pad with zeros if needed
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Convert hex to RGB
    static hexToRgba(hex: string): [number, number, number, number] {
        let r = 0, g = 0, b = 0, a = 1;

        if (hex.length === 5) { // #RGBA format
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
            a = parseInt(hex[4] + hex[4], 16) / 255;
        } else if (hex.length === 9) { // #RRGGBBAA format
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
            a = parseInt(hex[7] + hex[8], 16) / 255;
        } else if (hex.length === 4) { // #RGB format
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) { // #RRGGBB format
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }

        return [r, g, b, a];
    }

    fadeColor(startColor: string, endColor: string, duration: number, callback: (color: string) => void) {
        const start = performance.now();

        const animate = (time: number) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1); // Ensure progress does not exceed 1

            // Get the interpolated color
            const color = this.interpolateColor(startColor, endColor, progress);

            // Call the callback with the interpolated color
            callback(color);

            // Continue the animation if not completed
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

// Interpolate between two colors, including opacity
    interpolateColor(color1: string, color2: string, factor: number): string {
        const [r1, g1, b1, a1] = ColorFader.hexToRgba(color1);
        const [r2, g2, b2, a2] = ColorFader.hexToRgba(color2);

        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        const a = a1 + (a2 - a1) * factor;

        return this.rgbaToHex(r, g, b, a);
    }

// Convert RGBA to hex
    private rgbaToHex(r: number, g: number, b: number, a: number): string {
        const hexAlpha = Math.round(a * 255).toString(16).padStart(2, '0');
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('') + hexAlpha;
    }

    private parseColor(color: string) {
        // Assuming color is in the form "#RRGGBB"
        const bigint = parseInt(color.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    }
}

export class MusicFader {
    async fadeOut(audio: HTMLAudioElement, time: number) {
        const initialVolume = audio.volume; // Get the current volume
        const steps = 100; // Number of steps in the fade-out
        const stepTime = time / steps; // Time per step
        for (let i = steps - 1; i >= 0; i--) {
            audio.volume = (i / steps) * initialVolume; // Adjust volume relative to the initial volume
            await new Promise(resolve => setTimeout(resolve, stepTime));
        }
        audio.pause();
        audio.volume = initialVolume; // Reset to the initial volume
    }
}


export function randomNumber(from: number, to: number): number {
    return Math.floor(Math.random() * (to - from + 1) + from);
}

export interface WeightedItem<T> {
    item: T;
    weight: number;
}

export function getRandomWeightedItem<T>(items: WeightedItem<T>[]): T {
    // Filter out non-positive weights
    const validItems = items.filter(({weight}) => weight > 0);
    if (validItems.length === 0) {
        throw new Error("All weights must be greater than zero.");
    }

    const totalWeight = validItems.reduce((sum, {weight}) => sum + weight, 0);
    const threshold = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    for (const {item, weight} of validItems) {
        cumulativeWeight += weight;
        if (threshold < cumulativeWeight) {
            return item;
        }
    }

    // Fallback, should never happen
    return validItems[validItems.length - 1].item;
}


export function countWithDelay(start: number, end: number, delay: number, emit: (value: number) => void): Promise<void> {
    return new Promise((resolve) => {
        let current = start;
        const step = start < end ? 1 : -1;

        const interval = setInterval(() => {
            emit(current);
            if (current === end) {
                clearInterval(interval);
                resolve();
            }
            current += step;
        }, delay);
    });
}
