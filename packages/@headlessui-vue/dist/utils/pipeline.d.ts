export interface Middleware<ReqType> {
    (request: ReqType, next: (req: ReqType) => void): void;
}
export declare function pipeline<ReqType>(handlers: Middleware<ReqType>[]): (request: ReqType, andThen?: (req: ReqType) => void) => void;
