/**
 * student lifecycle
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

const encodeMobile = (value: unknown): string | null => {
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

export default {
  beforeCreate(event: any) {
    const data = event?.params?.data;
    if (data && typeof data === 'object' && 'mobile' in data) {
      data.mobile = encodeMobile(data.mobile);
    }
  },

  beforeUpdate(event: any) {
    const data = event?.params?.data;
    if (data && typeof data === 'object' && 'mobile' in data) {
      data.mobile = encodeMobile(data.mobile);
    }
  },

  beforeCreateMany(event: any) {
    const data = event?.params?.data;
    if (Array.isArray(data)) {
      event.params.data = data.map((item: any) => {
        if (item && typeof item === 'object' && 'mobile' in item) {
          return { ...item, mobile: encodeMobile(item.mobile) };
        }
        return item;
      });
    }
  },

  beforeUpdateMany(event: any) {
    const data = event?.params?.data;
    if (data && typeof data === 'object' && 'mobile' in data) {
      data.mobile = encodeMobile(data.mobile);
    }
  },
};
