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

export const getPaginationOptions = (query: any): PaginationOptions => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const sort = query.sort || '-createdAt';
  const select = query.select || '';

  return {
    page: Math.max(1, page),
    limit: Math.min(50, Math.max(1, limit)), // Max 50 items per page
    sort,
    select
  };
};

export const createPaginationResult = <T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginationResult<T> => {
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