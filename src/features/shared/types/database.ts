export type DbKey = {
    pkName: string;
    pk: string;
    skName?: string;
    sk?: string;
};

export type QueryOptions = {
    indexName?: string;
    limit?: number;
    scanIndexForward?: boolean;
};

export type TransactWriteOperation =
    | {
          type: "put";
          tableName: string;
          item: Record<string, unknown>;
      }
    | {
          type: "delete";
          tableName: string;
          key: DbKey;
      };
