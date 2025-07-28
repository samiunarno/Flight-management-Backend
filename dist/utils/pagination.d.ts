export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: string;
    select?: string;
}
export interface PaginationResult<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
export declare const getPaginationOptions: (query: any) => PaginationOptions;
export declare const createPaginationResult: <T>(data: T[], totalItems: number, page: number, limit: number) => PaginationResult<T>;
//# sourceMappingURL=pagination.d.ts.map