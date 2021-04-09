import { Cache } from "src/app/services/cache.service";
import { BaseTypePacket } from "../../packets/base-type.packet";
import { BuildOrderPacket } from "../../packets/build-order.packet";
import { Button } from "../core/button.ui";

export class ArmyBaseButton extends Button {

    private baseType: BaseTypePacket;

    constructor(base: BaseTypePacket, x: number, y: number) {
        super(x, y, 40, 40, 3, ArmyBaseButton.getIcon(base));
        this.baseType = base;
    }

    static getIcon(base: BaseTypePacket): string {
        switch (base.id) {
            case 1:
                return "../../../assets/ui/base.png";
            case 2:
                return "../../../assets/ui/base.png";
            case 3:
                return "../../../assets/ui/base.png";
            case 4:
                return "../../../assets/ui/base.png";
              
            default:
                return "../../../assets/ui/base.png";

        }
    }

    update(x: number, y: number) {
        this.checkHover(x, y);
        const tile = Cache.getTile(Cache.selectedArmy?.x as number, Cache.selectedArmy?.y as number);
        this.disabled = !this.hasSufficientResources() || 
            !!Cache.selectedArmy?.buildEvent || 
            !!Cache.selectedArmy?.moveEvent ||
            !tile ||
            !!tile.base;
    }

    hasSufficientResources() {
        const army = Cache.selectedArmy;
        if (!army) {
            return false;
        }
        return army.inventory.wood >= this.baseType.wood &&
            army.inventory.stone >= this.baseType.stone &&
            army.inventory.ore >= this.baseType.ore;
    }

    handleClick(): boolean {
        if (this.hovered && !this.disabled && Cache.selectedArmy) {
            Cache.ws.buildBuilding({
                game_id: Cache.getGameId(),
                army_id: Cache.selectedArmy.id,
                x: Cache.selectedArmy.x,
                y: Cache.selectedArmy.y,
                base_type_id: this.baseType.id
            } as BuildOrderPacket);
            return true;
        }
        return false;
    }

}