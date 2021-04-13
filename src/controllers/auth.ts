import User from "src/models/user";
import { POST } from "src/@decorators/http.decorator";
import {Response, ResponseError} from "src/controllers";
import {AuthClaim, ControllerData} from "src/@types"
import * as Token from "src/utils/tokeniser"

export default class {
    @POST("api/v1/login")
    async createUser({body}: ControllerData): Promise<Response> {
        if (!body.username){
            throw new ResponseError(400, "username must be provided");
        }

        if (!body.pin){
            throw new ResponseError(400, "pin must be provided");
        }

        const user = await User.findByUsername(body.username);
        if(!user.authenticate(body.pin)){
            throw new ResponseError(400, "username or password is incorrect");
        }
        const data = user.toJSON();

        const tok = Token.create<AuthClaim>({
            id: user._id,
            role: user.role,
            purpose: "authentication",
        })
        delete data.pin;
        return new Response(200, {
            error: false,
            message: "User was created successfully",
            data,
            token: tok,
        })
    }
}