
export class Battalion {
    id: string;
    army_id: string;
    size: number;

    constructor(data: any) {
        this.id = data.id;
        this.army_id = data.army_id;
        this.size = data.size;
    }  

}