/**
 * student lifecycle - Strapi v5
 */

const isBase64String = (value: string): boolean => {
  if (typeof value !== 'string') return false;
  const str = value.trim();
  if (str === '') return false;
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  const base64UrlRegex = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2}==|[A-Za-z0-9_-]{3}=)?$/;
  if (!base64Regex.test(str) && !base64UrlRegex.test(str)) {
    return false;
  }
  if (str.length % 4 !== 0) return false;
  return true;
};

const encodeField = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === '') return '';
  if (isBase64String(str)) {
    return str;
  }
  try {
    return Buffer.from(str, 'utf8').toString('base64');
  } catch {
    return str;
  }
};

const decodeField = (value: unknown): string | unknown => {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'string') return value;
  const str = value.trim();
  if (str === '') return str;
  if (!isBase64String(str)) {
    return value;
  }
  try {
    const decoded = Buffer.from(str, 'base64').toString('utf8');
    if (decoded === '') {
      return value;
    }
    return decoded;
  } catch {
    return value;
  }
};

const transformEntity = (entity: any): any => {
  if (!entity || typeof entity !== 'object') return entity;
  if (entity.data && typeof entity.data === 'object' && !Array.isArray(entity.data)) {
    if ('mobile' in entity.data) {
      entity.data.mobile = decodeField(entity.data.mobile);
    }
    if ('CardID' in entity.data) {
      entity.data.CardID = decodeField(entity.data.CardID);
    }
    return entity;
  }
  if ('mobile' in entity) {
    entity.mobile = decodeField(entity.mobile);
  }
  if ('CardID' in entity) {
    entity.CardID = decodeField(entity.CardID);
  }
  return entity;
};

const transformResult = (result: any): any => {
  if (result === null || result === undefined) return result;
  if (Array.isArray(result)) {
    return result.map((e: any) => transformEntity(e));
  }
  if (result.data && Array.isArray(result.data)) {
    return {
      ...result,
      data: result.data.map((e: any) => transformEntity(e)),
    };
  }
  return transformEntity(result);
};

export default {
  beforeCreate(event: any) {
    const data = event?.params?.data;
    if (data && typeof data === 'object') {
      if ('mobile' in data) data.mobile = encodeField(data.mobile);
      if ('CardID' in data) data.CardID = encodeField(data.CardID);
    }
  },
  afterCreate(event: any) {
    event.result = transformResult(event.result);
  },
  beforeCreateMany(event: any) {
    const data = event?.params?.data;
    if (Array.isArray(data)) {
      event.params.data = data.map((item: any) => {
        if (item && typeof item === 'object') {
          const updated: any = { ...item };
          if ('mobile' in updated) updated.mobile = encodeField(updated.mobile);
          if ('CardID' in updated) updated.CardID = encodeField(updated.CardID);
          return updated;
        }
        return item;
      });
    }
  },
  afterCreateMany(event: any) {
    event.result = transformResult(event.result);
  },
  beforeUpdate(event: any) {
    const data = event?.params?.data;
    if (data && typeof data === 'object') {
      if ('mobile' in data) data.mobile = encodeField(data.mobile);
      if ('CardID' in data) data.CardID = encodeField(data.CardID);
    }
  },
  afterUpdate(event: any) {
    event.result = transformResult(event.result);
  },
  beforeUpdateMany(event: any) {
    const data = event?.params?.data;
    if (data && typeof data === 'object') {
      if ('mobile' in data) data.mobile = encodeField(data.mobile);
      if ('CardID' in data) data.CardID = encodeField(data.CardID);
    }
  },
  afterUpdateMany(event: any) {
    event.result = transformResult(event.result);
  },
  afterDelete(event: any) {
    event.result = transformResult(event.result);
  },
  afterDeleteMany(event: any) {
    event.result = transformResult(event.result);
  },
  afterFindOne(event: any) {
    event.result = transformResult(event.result);
  },
  afterFindMany(event: any) {
    event.result = transformResult(event.result);
  },
};
