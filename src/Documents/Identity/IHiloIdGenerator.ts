export interface IHiloIdGenerator {
    generateDocumentId(...args: any[]): Promise<string>;

    returnUnusedRange(): Promise<void>;
}
