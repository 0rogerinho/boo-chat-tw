type TResponse = {
    data: {
        public_key: string;
    };
    message: string;
};
export declare function getKickPublicKey(): Promise<TResponse>;
export {};
