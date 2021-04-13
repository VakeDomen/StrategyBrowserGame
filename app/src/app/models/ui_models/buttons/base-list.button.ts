import { Cache } from "src/app/services/cache.service";
import { Button } from "../core/button.ui";
import { GUI } from "../GUI";
import { BaseListWindow } from "../windows/base-list.window";

export class BaseListButton extends Button {

    private gui: GUI;

    constructor(gui: GUI) {
        super(1600 - 110, 10, 40, 40, 3, "../../../assets/ui/base.png")
        this.gui = gui;
    }

    handleClick(): boolean {
        if (this.hovered) {
            Cache.sideWindow = 'base';
        }
        return this.hovered;
    }
}