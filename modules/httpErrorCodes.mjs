
// The point of this class is increasing readability and maintainability of the rest of the code. 
// It should be extended and refactord as needed.

class HTTPCodes {

    static SuccesfullRespons = {
        Ok: 200
    }

    static ClientSideErrorRespons = {
        BadRequest: 400,
        Unauthorized: 401,
        PaymentRequired: 402,
        Forbidden: 404,
        NotFound: 404,
        MethodNotAllowed: 405,
        NotAcceptable: 406
    }

}

