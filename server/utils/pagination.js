/**
 * Standardize pagination across list routes.
 * Parses req.query for page/limit and returns mongoose skip/limit variables + meta info.
 */
export const getPaginationInfo = (queryPage, queryLimit, defaultLimit = 10) => {
  const page = Math.max(1, parseInt(queryPage, 10) || 1);
  const limit = Math.max(1, parseInt(queryLimit, 10) || defaultLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginationMeta = (totalDocs, page, limit) => {
  return {
    total: totalDocs,
    page,
    pages: Math.ceil(totalDocs / limit),
    limit,
  };
};
