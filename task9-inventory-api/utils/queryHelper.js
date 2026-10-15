// Shared helpers for pagination, filtering and sorting on all list endpoints.

// Escape user text so it is matched literally inside a regular expression
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ?page=2&limit=5  ->  { page, limit, skip }
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// ?sort=-price,name  ->  { price: -1, name: 1 }  (only whitelisted fields)
const parseSort = (sortParam, allowedFields, defaultSort) => {
  if (!sortParam || typeof sortParam !== 'string') return defaultSort;

  const sort = {};
  sortParam.split(',').forEach((part) => {
    const trimmed = part.trim();
    const field = trimmed.replace(/^-/, '');
    if (allowedFields.includes(field)) {
      sort[field] = trimmed.startsWith('-') ? -1 : 1;
    }
  });
  return Object.keys(sort).length ? sort : defaultSort;
};

// ?minPrice=10&maxPrice=50  ->  filter.price = { $gte: 10, $lte: 50 }
const addRange = (filter, field, min, max) => {
  const range = {};
  if (min !== undefined && min !== '' && !isNaN(Number(min))) range.$gte = Number(min);
  if (max !== undefined && max !== '' && !isNaN(Number(max))) range.$lte = Number(max);
  if (Object.keys(range).length) filter[field] = range;
};

// Case-insensitive "contains" match on several fields
const searchFilter = (text, fields) => {
  const regex = new RegExp(escapeRegex(String(text).trim()), 'i');
  return fields.map((field) => ({ [field]: regex }));
};

// Runs find() and countDocuments() with the SAME filter, and shapes the response
const paginate = async (Model, { filter, sort, page, limit, skip }, populate) => {
  let query = Model.find(filter)
    .sort({ ...sort, _id: 1 }) // _id tie-breaker keeps page order stable
    .skip(skip)
    .limit(limit);
  if (populate) query = query.populate(populate);

  const [data, total] = await Promise.all([query, Model.countDocuments(filter)]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    count: data.length,
    data,
  };
};

module.exports = { escapeRegex, parsePagination, parseSort, addRange, searchFilter, paginate };