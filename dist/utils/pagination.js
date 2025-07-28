"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationResult = exports.getPaginationOptions = void 0;
const getPaginationOptions = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const sort = query.sort || '-createdAt';
    const select = query.select || '';
    return {
        page: Math.max(1, page),
        limit: Math.min(50, Math.max(1, limit)),
        sort,
        select
    };
};
exports.getPaginationOptions = getPaginationOptions;
const createPaginationResult = (data, totalItems, page, limit) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};
exports.createPaginationResult = createPaginationResult;
//# sourceMappingURL=pagination.js.map