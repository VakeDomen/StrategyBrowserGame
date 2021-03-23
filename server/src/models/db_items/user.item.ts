import { DbItem } from './core/db.item';
export class UserItem extends DbItem {
	
	username: string;
	password: string;

	constructor(data: any) {
		super(data);
		this.username = data.username;
		this.password = data.password;

	}

	isValid(): boolean {
		return !!this.username && !!this.password;
	}
}