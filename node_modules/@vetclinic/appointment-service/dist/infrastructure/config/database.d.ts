import mongoose from 'mongoose';
export interface DatabaseConfig {
    uri: string;
    options?: mongoose.ConnectOptions;
}
export declare class DatabaseConnection {
    private static instance;
    private _isConnected;
    private connection;
    private constructor();
    static getInstance(): DatabaseConnection;
    connect(config: DatabaseConfig): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getConnection(): mongoose.Connection;
    getMongoose(): typeof mongoose;
    private setupEventListeners;
    withTransaction<T>(callback: (session: mongoose.ClientSession) => Promise<T>): Promise<T>;
    healthCheck(): Promise<boolean>;
    createIndexes(): Promise<void>;
}
export declare const database: DatabaseConnection;
//# sourceMappingURL=database.d.ts.map