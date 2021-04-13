import { deleteItem, fetch } from "../../db/database.handler";
import * as conf from '../../db/database.config.json';
import { ArmyItem } from "../db_items/army.item";
import { Army } from "../game_models/army.game";
import { Battalion } from "../game_models/battalion.game";
import { Event } from "./core/event";
import { TileItem } from "../db_items/tile.item";
import { BattalionItem } from "../db_items/battalion.item";
import { SocketHandler } from "../../sockets/handler.socket";
import { Report } from "../game_models/report.game";
import { Base } from "../game_models/base.game";
import { basename } from "node:path";

export class ArmyBattleEvent extends Event {
    
    initiator: string;
    defender: string;
    battleTile: TileItem | undefined;
    
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
            // save inital state for report
            const preInitiator = initiator.exportPacket();
            const preDefender = defender.exportPacket();

            // find battle location (for tile modifiers)
            this.battleTile = (await fetch<TileItem>(conf.tables.tile, new TileItem({x: defender.x, y: defender.y}))).pop();
            
            // fight the armies and get the resource drop from casualties
            const drops = await this.fight(initiator.battalions, defender.battalions);
            
            // determine who won
            const attackingArmy = await this.getArmy(this.initiator);
            const defendingArmy = await this.getArmy(this.defender);
            let victoriousArmy: Army | undefined;
            let defeatedArmy: Army | undefined;
            if (attackingArmy?.battalions.length) {
                victoriousArmy = attackingArmy;
                defeatedArmy = defender;
            } else {
                victoriousArmy = defendingArmy;
                defeatedArmy = initiator;
            }
            // if nothing went wrong and not both dead
            if (victoriousArmy && defeatedArmy && victoriousArmy.inventory) {
                // if inventory too full (due to casualties)
                // empty unitll valid
                let dropsFromOverfill: any;
                if (await victoriousArmy.inventory.calcWeight() as number > victoriousArmy.inventorySpace) {
                    dropsFromOverfill = await victoriousArmy.inventory.emptyInventoryOverfill(victoriousArmy.inventorySpace);
                }
                const overflow1 = await victoriousArmy.addToInventory(drops);
                const overflow2 = await victoriousArmy.mergeInventory(defeatedArmy.inventory);
                const allOverflow = this.mergeDrops(dropsFromOverfill, overflow1, overflow2);

                await victoriousArmy.saveItem();
                await defeatedArmy.deleteItem();
                const lootPile = new Base({
                    x: defender.x,
                    y: defender.y,
                    base_type: 6
                });
                await lootPile.saveItem();
                await lootPile.load();
                await lootPile.inventory?.addToInventory(allOverflow);
                await lootPile.saveItem();
            }
            // save remains for report
            const postInitiator = initiator.exportPacket();
            const postDefender = defender.exportPacket();
            SocketHandler.broadcastToGame(this.game_id, 'ARMY_DEFEATED', defeatedArmy.id)
            SocketHandler.broadcastToGame(this.game_id, 'GET_ARMY', victoriousArmy?.exportPacket());

            // generate reports
            const initiatorReport = new Report({
                player_id: initiator.player_id,
                report_read: false,
                report_type: 'ARMY_FIELD_BATTLE',
                body: JSON.stringify({
                    preInitiator,
                    preDefender,
                    postInitiator,
                    postDefender
                })
            });
            const defenderReport = new Report({
                player_id: defender.player_id,
                report_read: false,
                report_type: 'ARMY_FIELD_BATTLE',
                body: JSON.stringify({
                    preInitiator,
                    preDefender,
                    postInitiator,
                    postDefender
                })
            });
            await initiatorReport.saveItem();
            await defenderReport.saveItem();
            SocketHandler.broadcastToGame(this.game_id, 'NEW_REPORT', initiatorReport.exportPacket());
            SocketHandler.broadcastToGame(this.game_id, 'NEW_REPORT', defenderReport.exportPacket());
        }
        return undefined;
    }

    private async fight(att: Battalion[], def: Battalion[]): Promise<any> {
        let ambush = true;
        let turn = 0;
        // set defender battalions as defenders
        def.forEach((b: Battalion) => b.isDefender = true);
        const allBattalions = [...att, ...def];
        while (!this.oneIsDefeated(att, def)) {
            console.log('Turn', turn);
            turn++;
            // merge all batalions
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
                    // add terrain modifiers
                    if (this.battleTile) {
                        await attacker.weightStatsByTile(this.battleTile.x, this.battleTile.y);
                        await Promise.all(defenders.map( async (defr: Battalion) => await defr.weightStatsByTile(this.battleTile?.x, this.battleTile?.y)));
                    }
                    // calculate attacker damage per defending batalion
                    const dmg = Math.ceil((attacker.attack / defenders.length));
                    console.log(`\tattacker ${attacker.id.substr(0, 5)} dealing ${attacker.attack} dmg to ${defenders.length} defenders (DMG PER DEF: ${dmg})`)
                    // apply dmg to all defending battalions
                    defenders.forEach((defender: Battalion) => defender.recieveDmg(dmg));
                }
            }
        }
        // calculate dead soldiers item drops
        const drops: any = {};
        allBattalions.forEach((battalion: Battalion) => {
            const casualties = battalion.preBattleSize - battalion.size;
            if (battalion.WEAPON_1H) drops[battalion.WEAPON_1H] ? drops[battalion.WEAPON_1H] += Math.floor(casualties * 0.3) : drops[battalion.WEAPON_1H] = Math.floor(casualties * 0.3);
            if (battalion.WEAPON_2H) drops[battalion.WEAPON_2H] ? drops[battalion.WEAPON_2H] += Math.floor(casualties * 0.3) : drops[battalion.WEAPON_2H] = Math.floor(casualties * 0.3);
            if (battalion.OFF_HAND) drops[battalion.OFF_HAND] ? drops[battalion.OFF_HAND] += Math.floor(casualties * 0.3) : drops[battalion.OFF_HAND] = Math.floor(casualties * 0.3);
            if (battalion.horse) drops[6] ? drops[6] += Math.floor(casualties * 0.3) : drops[6] = Math.floor(casualties * 0.3);
            if (battalion.cart) drops[5] ? drops[5] += Math.floor(casualties * 0.3) : drops[5] = Math.floor(casualties * 0.3);
            if (battalion.TOOL) drops[battalion.TOOL] ? drops[battalion.TOOL] += Math.floor(casualties * 0.3) : drops[battalion.TOOL] = Math.floor(casualties * 0.3);
        });
        // if attacker has at least one battalion with alive soldiers => attacker won
        if (att.map((b: Battalion) => b.size > 0).includes(true)) {
            console.log('Attacker won with:')
            att.map((b: Battalion) => console.log(`\t${b.id.substr(0, 5)} remaining ${b.size} units`));
        } else {
            // defender won
            console.log('Defender won with:')
            def.map((b: Battalion) => console.log(`\t${b.id.substr(0, 5)} remaining ${b.size} units`));
        }

        // save updated data
        // delete dead battalions
        await Promise.all(
            allBattalions
                .filter((bat: Battalion) => bat.size <= 0)
                .map(async (b: Battalion) => await deleteItem(conf.tables.battalion, new BattalionItem({id: b.id})))
        );
        // save alive battalions
        await Promise.all(
            allBattalions
                .filter((bat: Battalion) => bat.size > 0)
                .map(async (b: Battalion) => await b.saveItem())
        );
        // 
        return drops;
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

    private async getArmy(id: string): Promise<Army | undefined> {
        const army = (await fetch<ArmyItem>(conf.tables.army, new ArmyItem({id: id}))).pop();
        if (army) {
            const loadedArmy = new Army(army);
            await loadedArmy.load();
            return loadedArmy;
        }
        return undefined;
    }

    private mergeDrops(d1: any, d2: any, d3: any): any {
        let all = {};
        for (const d of [d1, d2, d3]) {
            if (!d) {
                continue;
            }
            for (const key of Object.keys(d)) {
                if(all[key]) {
                    all[key] += d[key];
                } else {
                    all[key] = d[key];
                }
            }
        }
        return all;
    }
}