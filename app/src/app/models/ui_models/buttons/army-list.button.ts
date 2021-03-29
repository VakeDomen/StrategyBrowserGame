import { Cache } from "src/app/services/cache.service";
import { Button } from "../core/button.ui";
import { GUI } from "../GUI";
import { ArmyListWindow } from "../windows/army-list.window";

export class ArmyListButton extends Button {

    private gui: GUI;

    constructor(gui: GUI) {
        super(1600 - 60, 10, 40, 40, 4, "../../../assets/ui/helmet_icon.png")
        this.gui = gui;
    }

    handleClick(): boolean {
        if (this.hovered) {
            this.gui.addWindow(new ArmyListWindow(Cache.getPlayerArmies(Cache.getMe().id)));
        }
        return this.hovered;
    }
}