import mongoose from 'mongoose';
export declare abstract class BaseMongoRepository<T> {
    protected abstract model: mongoose.Model<any>;
    protected abstract toEntity(doc: any): T;
    protected abstract toDocument(entity: T): any;
    protected isValidObjectId(id: string): boolean;
    protected validateId(id: string): void;
    exists(id: string): Promise<boolean>;
    delete(id: string): Promise<void>;
    protected handleDatabaseError(error: unknown, operation: string): never;
    protected executeWithLogging<R>(operation: string, fn: () => Promise<R>): Promise<R>;
}
//# sourceMappingURL=BaseMongoRepository.d.ts.map