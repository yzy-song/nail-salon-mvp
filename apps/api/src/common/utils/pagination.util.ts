export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export function createPaginator<T>(
  limit = 10,
): (items: T[], total: number, page?: number) => PaginatedResult<T> {
  return (items: T[], total: number, page = 1): PaginatedResult<T> => {
    const lastPage = Math.ceil(total / limit);
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        lastPage,
      },
    };
  };
}
