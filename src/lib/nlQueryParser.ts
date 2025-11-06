export interface QueryCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

export interface ParsedQuery {
  conditions: QueryCondition[];
  timeRange?: { start?: string; end?: string };
  orderBy?: string;
  limit?: number;
}

export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  const conditions: QueryCondition[] = [];
  let timeRange: { start?: string; end?: string } | undefined;

  if (lowerQuery.includes('login') || lowerQuery.includes('login attempt')) {
    conditions.push({ field: 'event_type', operator: '=', value: 'login' });
  }

  if (lowerQuery.includes('file download') || lowerQuery.includes('download')) {
    conditions.push({ field: 'action', operator: '=', value: 'file_download' });
  }

  if (lowerQuery.includes('file access') || lowerQuery.includes('file read')) {
    conditions.push({ field: 'event_type', operator: '=', value: 'file_access' });
  }

  if (lowerQuery.includes('successful') || lowerQuery.includes('succeeded')) {
    conditions.push({ field: 'status', operator: '=', value: 'success' });
  }

  if (lowerQuery.includes('failed') || lowerQuery.includes('failure')) {
    conditions.push({ field: 'status', operator: '=', value: 'failed' });
  }

  const countryMatch = lowerQuery.match(/from\s+(?:outside\s+)?(?:the\s+)?([a-z\s]+?)(?:\s+between|\s+that|\s+in|\s+with|$)/i);
  if (countryMatch) {
    const country = countryMatch[1].trim();
    if (country === 'outside the us' || country === 'outside us') {
      conditions.push({ field: 'country', operator: '!=', value: 'US' });
    } else {
      const normalizedCountry = country.toUpperCase().substring(0, 2);
      conditions.push({ field: 'country', operator: '=', value: normalizedCountry });
    }
  }

  const timeMatch = lowerQuery.match(/between\s+(\d+)\s*(?:am|pm)?\s*and\s+(\d+)\s*(am|pm)?/i);
  if (timeMatch) {
    let start = parseInt(timeMatch[1]);
    let end = parseInt(timeMatch[2]);
    const period = timeMatch[3]?.toLowerCase();

    if (period === 'pm' && end < 12) end += 12;
    if (period === 'am' && start === 12) start = 0;
    if (period === 'pm' && start < 12 && start < end) start += 12;

    timeRange = {
      start: `${start.toString().padStart(2, '0')}:00:00`,
      end: `${end.toString().padStart(2, '0')}:00:00`,
    };
  }

  const ipMatch = lowerQuery.match(/ip\s+(?:address\s+)?(?:is\s+)?([0-9.]+)/i);
  if (ipMatch) {
    conditions.push({ field: 'ip_address', operator: '=', value: ipMatch[1] });
  }

  const userMatch = lowerQuery.match(/user\s+(?:id\s+)?(?:is\s+)?['"]?([a-z0-9_]+)['"]?/i);
  if (userMatch) {
    conditions.push({ field: 'user_id', operator: '=', value: userMatch[1] });
  }

  return {
    conditions,
    timeRange,
    orderBy: 'timestamp',
    limit: 100,
  };
}

export function generateSQL(parsed: ParsedQuery): string {
  let sql = 'SELECT * FROM forensic_events WHERE true';

  for (const condition of parsed.conditions) {
    const value = typeof condition.value === 'string' ? `'${condition.value}'` : condition.value;
    sql += ` AND ${condition.field} ${condition.operator} ${value}`;
  }

  if (parsed.timeRange) {
    if (parsed.timeRange.start) {
      sql += ` AND EXTRACT(HOUR FROM timestamp) >= ${parseInt(parsed.timeRange.start)}`;
    }
    if (parsed.timeRange.end) {
      sql += ` AND EXTRACT(HOUR FROM timestamp) <= ${parseInt(parsed.timeRange.end)}`;
    }
  }

  if (parsed.orderBy) {
    sql += ` ORDER BY ${parsed.orderBy} DESC`;
  }

  if (parsed.limit) {
    sql += ` LIMIT ${parsed.limit}`;
  }

  return sql;
}

export async function executeNaturalLanguageQuery(
  query: string,
  supabaseClient: { from: (table: string) => unknown }
): Promise<{ events: unknown[]; sqlQuery: string }> {
  const parsed = parseNaturalLanguageQuery(query);
  const sqlQuery = generateSQL(parsed);

  let queryBuilder: any = (supabaseClient.from('forensic_events') as any).select('*');

  for (const condition of parsed.conditions) {
    if (condition.operator === '=') {
      queryBuilder = queryBuilder.eq(condition.field, condition.value);
    } else if (condition.operator === '!=') {
      queryBuilder = queryBuilder.neq(condition.field, condition.value);
    } else if (condition.operator === '>') {
      queryBuilder = queryBuilder.gt(condition.field, condition.value);
    } else if (condition.operator === '<') {
      queryBuilder = queryBuilder.lt(condition.field, condition.value);
    }
  }

  if (parsed.orderBy) {
    queryBuilder = queryBuilder.order(parsed.orderBy, { ascending: false });
  }

  if (parsed.limit) {
    queryBuilder = queryBuilder.limit(parsed.limit);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Query error:', error);
    return { events: [], sqlQuery };
  }

  return { events: data || [], sqlQuery };
}
