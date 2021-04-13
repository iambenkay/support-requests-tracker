import { AuthRole, AuthClaim } from "src/@types";
import * as Token from "src/utils/tokeniser";
import User from "src/models/user";

export const Authorized = (...roles: Array<AuthRole>) => function (
    target: object,
    propertyKey: string | symbol,
    desc: PropertyDescriptor,
) {
    const pre = desc.value;

    desc.value = async function ({ body, params, headers, query, response, page }: any) {
        const authorizationToken = headers.authorization
            ? headers.authorization.split("Bearer ")[1]
            : null;
        if (!authorizationToken)
            return response.status(401).send({ message: "Invalid Authorization Token" });
        const payload = Token.decode<AuthClaim>(authorizationToken);
        if (
            !payload ||
            payload.purpose !== "authentication"
        )
            return response.status(401).send({
                message:
                    "You are not authorized to access this resource",
            });

        const user = await User.findById(payload.id);
        if (!user)
            return response.status(401).send({
                message:
                    "You are not authorized to access this resource",
            });

        if (roles && roles.length > 0 && !roles.includes(payload.role)) {
            return response.status(401).send({
                message:
                    "You are not authorized to access this resource",
            });
        }
        return pre.apply(this, [{ body, params, headers, query, claims: payload, response, page }])
    }
}