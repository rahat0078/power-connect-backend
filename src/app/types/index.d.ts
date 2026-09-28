export interface RequestUser {
	userId: string;
	name: string;
	email: string;
	role: Role;
}

declare global {
	namespace Express {
		interface Request {
			user?: RequestUser;
		}
	}
}