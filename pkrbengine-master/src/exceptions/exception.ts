import { HttpException, HttpStatus } from "@nestjs/common";

export class GameException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.NOT_ACCEPTABLE);
    }
}

export class GameActionException extends HttpException {
    constructor(message: string) {
        super(`GAME ACTION DENIED: ${message}`, HttpStatus.METHOD_NOT_ALLOWED);
    }
}

export class IncompleteDataException extends HttpException {
    constructor(exceptedData: {}) {
        super(`Incomplete data suplly; Expected: ${Object.keys(exceptedData)}`, HttpStatus.BAD_REQUEST)
    }
}

export class UnknwonIDException extends HttpException {
    constructor(objectName: string) {
        super(`Unknwon ${objectName} identifier`, HttpStatus.NOT_FOUND)
    }
}