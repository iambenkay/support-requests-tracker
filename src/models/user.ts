import mongoose from "mongoose";
import * as bcrypt from "src/utils/hasher";
import { AuthRole } from "src/@types";

interface IUser extends mongoose.Document {
	username: string;
	pin: string;
	role: AuthRole;
	authenticate(pin: string): boolean
}

interface IUserModel extends mongoose.Model<IUser, IUserModel> {
	findByUsername(username: string): Promise<IUser>;
}

const schema = new mongoose.Schema<IUser>(
	{
		username: {
			type: String,
			minlength: 1,
			unique: true,
		},
		role: {
			type: AuthRole,
			required: "You must provide accountType"
		},
		pin: {
			type: String,
			required: "You must provide password",
			set(value: string) {
				return bcrypt.hash(value);
			}
		}
	},
	{ timestamps: true }
);

schema.statics.findByUsername = function (username: string): Promise<number> {
	return this.findOne({ username });
};

schema.methods.authenticate = function (pin: string): boolean {
	return bcrypt.compare(pin, this.pin);
};

export default mongoose.model<IUser, IUserModel>("User", schema);
