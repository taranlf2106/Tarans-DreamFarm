

class HTTPCodes {

    static SuccesfullRespons = {
        Ok: 200,
        Created: 201 
    }

    static ClientSideErrorRespons = {
        BadRequest: 400,
        Unauthorized: 401,
        PaymentRequired: 402,
        Forbidden: 403,
        NotFound: 404,
        MethodNotAllowed: 405,
        NotAcceptable: 406
    }

    static ServerErrorRespons = {
        InternalError: 500,
        NotImplemented: 501,
    }

}
export default HTTPCodes;

const HTTPMethods = {
    POST: "POST",
    GET: "GET",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE"
}

export { HTTPCodes, HTTPMethods };