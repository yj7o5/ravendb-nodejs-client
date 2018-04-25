import { IRavenObject } from "../../Types/IRavenObject";
import { DocumentConventions } from "../Conventions/DocumentConventions";
import { IDisposable } from "../../Types/Contracts";
import { AbstractCallback } from "../../Types/Callbacks";
import { RequestExecutor } from "../../Http/RequestExecutor";
import { DocumentType, EntityConstructor } from "../DocumentAbstractions";
import { EntitiesCollectionObject } from "../../Types";

export class SessionInfo {
    public sessionId: number;

    public constructor(sessionId?: number) {
        this.sessionId = sessionId;
    }
}

export interface IMetadataDictionary {
    [key: string]: Object;
}

export type ConcurrencyCheckMode = "Auto" | "Forced" | "Disabled";

// export interface IDocumentSession extends IDisposable {

//     /**
//      * Get the accessor for advanced operations
//      *
//      * Those operations are rarely needed, and have been moved to a separate
//      * property to avoid cluttering the API
//      * @return Advanced session operations
//      */
//     advanced(): IAdvancedSessionOperations;

//     /**
//      * Marks the specified entity for deletion.
//      * The entity will be deleted when IDocumentSession.saveChanges is called.
//      * @param <T> entity class
//      * @param entity instance of entity to delete
//      */
//     delete<T>(entity: T): void;

//     /**
//      * Marks the specified entity for deletion. 
//      * The entity will be deleted when DocumentSession.saveChanges is called.
//      * WARNING: This method will not call beforeDelete listener!
//      * @param id entity id
//      */
//     delete(id: string): void;

//     /**
//      * Marks the specified entity for deletion. 
//      * The entity will be deleted when DocumentSession.saveChanges is called.
//      * WARNING: This method will not call beforeDelete listener!
//      * @param id entity Id
//      * @param expectedChangeVector Expected change vector of a document to delete.
//      */
//     delete(id: string, expectedChangeVector: string): void;

//     /**
//      * Saves all the pending changes to the server.
//      */
//     saveChanges(): void;

//     /**
//      * Stores entity in session with given id and forces concurrency check with given change-vector.
//      * @param entity Entity to store
//      * @param changeVector Change vector
//      * @param id Document id
//      */
//     store(entity: string, changeVector: string, id: string): void;


//     /**
//      * Stores the specified dynamic entity, under the specified id.
//      * @param entity entity to store
//      * @param id Id to store this entity under. If other entity exists with the same id it will be overwritten.
//      */
//     store(entity: Object, id: string): void;

//     /**
//      * Stores entity in session, extracts Id from entity using Conventions or generates new one if it is not available.
//      * Forces concurrency check if the Id is not available during extraction.
//      * @param entity Entity to store
//      */
//     store(entity: string): void;

//     /**
//      * Begin a load while including the specified path
//      * Path in documents in which server should look for a 'referenced' documents.
//      * @param path Path to include
//      * @return Loader with includes
//      */
//     // TODO @gregolsky
//     // include(String path): ILoaderWithInclude;


//     //TBD: another includes here?

//     /**
//      *  Loads the specified entity with the specified id.
//      *  @param <T> entity class
//      *  @param clazz Object class
//      *  @param id Identifier of a entity that will be loaded.
//      *  @return Loaded entity
//      */
//     load<T>(id): T;
//     <TResult> Map<String, TResult> load(Class<TResult> clazz, String... ids);
//     <TResult> Map<String, TResult> load(Class<TResult> clazz, Collection<String> ids);

//     <T> IDocumentQuery<T> query(Class<T> clazz);

//     <T> IDocumentQuery<T> query(Class<T> clazz, Query collectionOrIndexName);

//     <T, TIndex extends AbstractIndexCreationTask> IDocumentQuery<T> query(Class<T> clazz, Class<TIndex> indexClazz);

// }

export interface IDocumentSession extends IDisposable {
    numberOfRequestsInSession: number;
    conventions: DocumentConventions;
    //   advanced: AdvancedSessionOperations;

    load<TEntity extends Object = IRavenObject>(
        id: string, 
        callback?: AbstractCallback<TEntity>): Promise<TEntity>;
    load<TEntity extends Object = IRavenObject>(
        id: string, 
        options?: ISessionOperationOptions<TEntity>, 
        callback?: AbstractCallback<TEntity>): Promise<TEntity>;
    load<TEntity extends Object = IRavenObject>(
        ids: string[], 
        callback?: AbstractCallback<EntitiesCollectionObject<TEntity>>): Promise<EntitiesCollectionObject<TEntity>>;
    load<TEntity extends Object = IRavenObject>(
        ids: string[], 
        options?: ISessionOperationOptions<TEntity>, 
        callback?: AbstractCallback<TEntity>): 
        Promise<EntitiesCollectionObject<TEntity>>;

    //   delete<T extends Object = IRavenObject>(id: string, callback?: EntityCallback<T | null | void>): Promise<T | null | void>;
    //   delete<T extends Object = IRavenObject>(id: string, options?: ISessionOperationOptions<T | null | void>, callback?: EntityCallback<T | null | void>): Promise<T | null | void>;
    //   delete<T extends Object = IRavenObject>(document: T, callback?: EntityCallback<T | null | void>): Promise<T | null | void>;
    //   delete<T extends Object = IRavenObject>(document: T, options?: ISessionOperationOptions<T | null | void>, callback?: EntityCallback<T | null | void>): Promise<T | null | void>;

      store<TEntity extends Object = IRavenObject>(
          document: TEntity, id?: string, callback?: AbstractCallback<TEntity>): Promise<void>;
      store<TEntity extends Object = IRavenObject>(
          document: TEntity, 
          id?: string, 
          options?: ISessionOperationOptions<TEntity>, 
          callback?: AbstractCallback<TEntity>): Promise<void>;

    //       query<T extends Object = IRavenObject>(options?: IDocumentQueryOptions<T>): IDocumentQuery<T>;

    saveChanges(): Promise<void>;
}

export interface ISessionOptions {
    database?: string;
    requestExecutor?: RequestExecutor;
}

export interface SessionStoreOptions<T> {
    documentType?: DocumentType<T>;
    changeVector?: string;
}

export interface ISessionOperationOptions<T> {
    documentType?: DocumentType<T>;
    includes?: string[];
    // nestedObjectTypes?: IRavenObject<EntityConstructor>;
    expectedChangeVector?: string;
    callback?: AbstractCallback<T | EntitiesCollectionObject<T>>;
}
