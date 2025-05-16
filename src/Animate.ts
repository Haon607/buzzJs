import { HueLightService } from "./app/services/hue-light.service";
import { shuffleArray } from "./utils";
import { BuzzDeviceService } from "./app/services/buzz-device.service";

export class Animate {
    hue: HueLightService;
    buzz: BuzzDeviceService;
    constructor(hue: HueLightService, buzz: BuzzDeviceService) {
        this.hue = hue;
        this.buzz = buzz;
    }

    public async gameOn(startPrimary: string, startSecondary: string, endPrimary: string, endSecondary: string): Promise<void> {
        new Audio('music/cahagiytyse/gameon.mp3').play();

        async function flash(hue: HueLightService, light: {id: number, baseColor: string}) {
            hue.setColor([light.id], '#FFFFFF', 100, 255);
            await new Promise(resolve => setTimeout(resolve, 300));
            hue.setColor([light.id], light.baseColor, 100);
        }

        this.hue.setColor(HueLightService.primary, startPrimary, 250);
        this.hue.setColor(HueLightService.secondary, startSecondary, 250);
        await new Promise(resolve => setTimeout(resolve, 839));
        //start
        const allLights = shuffleArray(/*HueLightService.primary.map(id => {return {id: id, baseColor: startPrimary}}).concat(*/HueLightService.secondary.map(id => {return {id: id, baseColor: startSecondary}}/*)*/));
        for (let i = 0; i < 15; i++) {
            flash(this.hue, allLights[i%allLights.length])
            const states = new Array(4).fill(false);
            states[i%4] = true;
            this.buzz.setLeds(states)
            // flash(this.hue, allLights[(i+(allLights.length/2))%allLights.length])
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        this.buzz.setLeds(new Array(4).fill(true))
        await new Promise(resolve => setTimeout(resolve, 400));
        this.buzz.setLeds(new Array(4).fill(false))
        // await new Promise(resolve => setTimeout(resolve, 3591));
        //end
        this.hue.setColor(HueLightService.primary, endPrimary, 100);
        this.hue.setColor(HueLightService.secondary, endSecondary, 100);
    }
}