import User from "src/models/user";
import { POST } from "src/@decorators/http.decorator";
import { Response, ResponseError } from "src/controllers";
import { ControllerData } from "src/@types"
import { pipeline } from "node:stream";

export default class {
    @POST("api/v1/users")
    async createUser({ body }: ControllerData): Promise<Response> {
        if (!body.pin || !/^\d{4}$/.test(body.pin)) {
            throw new ResponseError(400, "Invalid pin: must be 4 digits");
        }
        const user = new User({
            username: body.username,
            pin: body.pin,
            role: body.role
        })
        await user.save().catch(e => {
            throw new ResponseError(400, e.message);
        });
        const data = user.toJSON();
        delete data.pin;
        return new Response(201, {
            error: false,
            message: "User was created successfully",
            data: user
        })
    }
}