import { Cache } from "src/app/services/cache.service";
import { Button } from "../core/button.ui";
import { GUI } from "../GUI";

export class ArmyListButton extends Button {

    private gui: GUI;

    constructor(gui: GUI) {
        super(110, 850, 40, 40, 4, "../../../assets/ui/helmet_icon.png")
        this.gui = gui;
    }

    handleClick(): void {
        this.gui.createArmyListWindow(Cache.getPlayerArmies(Cache.getMe().id));
    }
}