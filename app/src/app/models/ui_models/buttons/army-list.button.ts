import { CacheService } from "src/app/services/cache.service";
import { Button } from "../core/button.ui";
import { GUI } from "../GUI";

export class ArmyListButton extends Button {

    private cache: CacheService;
    private gui: GUI;

    constructor(cache: CacheService, gui: GUI) {
        super(110, 850, 40, 40, 4, "../../../assets/ui/helmet_icon.png")
        this.cache = cache;
        this.gui = gui;
    }

    handleClick(): void {
        this.gui.createArmyListWindow(this.cache.getPlayerArmies(this.cache.getMe().id));
    }
}