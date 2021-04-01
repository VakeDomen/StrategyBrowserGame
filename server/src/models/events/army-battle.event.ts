import { fetch } from "../../db/database.handler";
import * as conf from '../../db/database.config.json';
import { ArmyItem } from "../db_items/army.item";
import { Army } from "../game_models/army.game";
import { Battalion } from "../game_models/battalion.game";
import { Event } from "./core/event";

export class ArmyBattleEvent extends Event {
    
    initiator: string;
    defender: string;
    
    constructor(data: any) {
        super(data);
        this.event_type = 'ARMY_BATTLE';
        this.initiator = data.initiator;
        this.defender = data.defender;
    }

    async trigger(): Promise<Event[] | undefined> {
        const initiator = await this.getArmy(this.initiator);
        const defender = await this.getArmy(this.defender);
        if (initiator && defender) {
            this.fight(initiator.battalions, defender.battalions);
        }
        return undefined;
    }

    private async fight(att: Battalion[], def: Battalion[]): Promise<Battalion[]> {
        let ambush = true;
        let turn = 0;
        while (!this.oneIsDefeated(att, def)) {
            console.log('turn', turn)
            turn++;
            // merge all batalions
            const allBattalions = [...att, ...def];
            // ids of batalions to attack this round
            let battalionsIds: string[] = [];
            // first turn on open battle is ambush (only archers deal damage)
            // attacker has initiative on tied speed
            if (ambush) {
                // extract archer battalions (equipped any bow)
                const attArchers = att.filter((bat: Battalion) => [10, 11, 12].includes(bat.WEAPON_2H));
                const defArchers = def.filter((bat: Battalion) => [10, 11, 12].includes(bat.WEAPON_2H));
                // sort all archers by initiative
                battalionsIds = this.sortBattalionsByInitiative([...attArchers, ...defArchers]).map((bat: Battalion) => bat.id);
                // set ambush to false for next turn
                ambush = false;
            } else {
                // sort all batalions by initiative 
                battalionsIds = this.sortBattalionsByInitiative(allBattalions.filter((bat: Battalion) => bat.size > 0)).map((bat: Battalion) => bat.id);

            }
            // console.log('attackers', battalionsIds.map((ba: any) => {
            //     const b = this.getBattalionById(ba, allBattalions) as Battalion;
            //     return [b.id, b.size, b.army_id]
            // }));
            // deal damage with selected batalions
            while (battalionsIds.length) {
                // get attacking battalion
                const atackingBattalionId = battalionsIds.shift() as string;
                const attacker: Battalion | undefined = this.getBattalionById(atackingBattalionId, allBattalions);
                // if attacker exists and battalion is not dead
                if (attacker && attacker.size > 0) {
                    // get all standing defenders
                    const allDefenderBattalions = attacker.army_id == this.initiator ? def : att;
                    const defenders: Battalion[] = allDefenderBattalions.filter((bat: Battalion) => bat.size > 0);
                    // if no defenders, battle is over
                    if (!defenders.length) {
                        break;
                    }
                    // refresh battle stats of all battalions 
                    // (units may have died in previous turn)
                    await attacker.load();
                    await Promise.all(defenders.map( async (defr: Battalion) => await defr.load()));

                    // calculate attacker damage per defending batalion
                    const dmg = Math.ceil((attacker.attack / defenders.length));
                    console.log(`attacker ${attacker.id.substr(0, 5)} dealing ${attacker.attack} dmg to ${defenders.length} defenders (DMG PER DEF: ${dmg})`)
                    // apply dmg to all defending battalions
                    defenders.forEach((defender: Battalion) => defender.recieveDmg(dmg));
                }
            }
        }
        // console.log(att, def)
        // if attacker has at least one battalion with alive soldiers => attacker won
        if (att.map((b: Battalion) => b.size > 0).includes(true)) {
            console.log('Attacker won with:')
            att.map((b: Battalion) => console.log(`\t${b.id.substr(0, 5)} remaining ${b.size} units`));
            return att;
        }
        // defender won
        console.log('Defender won with:')
        def.map((b: Battalion) => console.log(`\t${b.id.substr(0, 5)} remaining ${b.size} units`));
        return def;
    }

    getBattalionById(id: string, bats: Battalion[]): Battalion | undefined {
        for (const bat of bats) {
            if (bat.id == id) {
                return bat;
            }
        }
        return undefined;
    }

    private oneIsDefeated(att: Battalion[], def: Battalion[]): boolean {
        return this.isEmpty(att) || this.isEmpty(def);
    }

    private isEmpty(bats: Battalion[]): boolean {
        let size = 0;
        for (const bat of bats) {
            size += bat.size;
        }
        return size == 0;
    }

    private sortBattalionsByInitiative(battalions: Battalion[]): Battalion[] {
        return battalions.sort((b1: Battalion, b2: Battalion) => {
            if (!b1.speed || !b2.speed) {
                return 0;
            }
            if (b1.speed > b2.speed) return -1;
            if (b2.speed > b1.speed) return 1;
            if (b1.army_id == this.initiator) return -1;
            return 1;
        })
    }

    private async getArmy(id: string) {
        const army = (await fetch<ArmyItem>(conf.tables.army, new ArmyItem({id: id}))).pop();
        if (army) {
            const loadedArmy = new Army(army);
            await loadedArmy.load();
            return loadedArmy;
        }
        return undefined;
    }
}