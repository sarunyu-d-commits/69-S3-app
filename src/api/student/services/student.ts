/**
 * student service
 */

import { factories } from '@strapi/strapi';

const isBase64String = (value: string): boolean => {
  if (typeof value !== 'string') return false;
  const str = value.trim();
  if (str === '') return false;
  // ????????????? Base64 ?????????? (?????? + / =)
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(str)) {
    // ?????? Base64URL ??? - _
    if (!/^[A-Za-z0-9_-]*={0,2}$/.test(str)) {
      return false;
    }
  }
  // ?????????????? 4 ?????
  if (str.length % 4 !== 0) return false;
  return true;
};

const encodeMobile = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === '') return '';

  // ??????? double encode (???????????????????????????????????)
  if (isBase64String(str)) {
    return str;
  }

  try {
    return Buffer.from(str, 'utf8').toString('base64');
  } catch {
    return str;
  }
};

const decodeMobile = (value: unknown): string | unknown => {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'string') return value;
  const str = value.trim();
  if (str === '') return str;

  // ??????????????? base64 ????????????? (????????????????????????????)
  if (!isBase64String(str)) {
    return value;
  }

  try {
    const decoded = Buffer.from(str, 'base64').toString('utf8');
    // ??? decode ?????????????? ???????????????? ???????????????????????
    if (decoded === '') {
      return value;
    }
    return decoded;
  } catch {
    return value;
  }
};

const transformEntityMobile = (entity: any): any => {
  if (!entity || typeof entity !== 'object') return entity;

  // ???????????????? Strapi v5 (entity.data) ?????????????
  if (entity.data && typeof entity.data === 'object' && !Array.isArray(entity.data)) {
    if ('mobile' in entity.data) {
      entity.data.mobile = decodeMobile(entity.data.mobile);
    }
    return entity;
  }

  if ('mobile' in entity) {
    entity.mobile = decodeMobile(entity.mobile);
  }

  return entity;
};

const transformEntitiesMobile = (entities: any): any => {
  if (!entities) return entities;

  // ???????? Array
  if (Array.isArray(entities)) {
    return entities.map((e: any) => transformEntityMobile(e));
  }

  // ???????? Paginated Result { data: [...], meta: {...} } ??? Strapi v5
  if (entities.data && Array.isArray(entities.data)) {
    return {
      ...entities,
      data: entities.data.map((e: any) => transformEntityMobile(e)),
    };
  }

  // ???????? Single Entity
  return transformEntityMobile(entities);
};

export default factories.createCoreService('api::student.student', ({ strapi }) => ({
  async findMany(params: any) {
    const result = await super.findMany(params);
    return transformEntitiesMobile(result);
  },

  async findOne(params: any) {
    const result = await super.findOne(params);
    return transformEntityMobile(result);
  },

  async create(params: any) {
    if (params?.data && typeof params.data === 'object') {
      if ('mobile' in params.data) {
        params.data.mobile = encodeMobile(params.data.mobile);
      }
    }
    const result = await super.create(params);
    return transformEntityMobile(result);
  },

  async createMany(params: any) {
    if (params?.data && Array.isArray(params.data)) {
      params.data = params.data.map((item: any) => {
        if (item && typeof item === 'object' && 'mobile' in item) {
          return {
            ...item,
            mobile: encodeMobile(item.mobile),
          };
        }
        return item;
      });
    }
    const result = await super.createMany(params);
    return transformEntitiesMobile(result);
  },

  async update(params: any) {
    if (params?.data && typeof params.data === 'object') {
      if ('mobile' in params.data) {
        params.data.mobile = encodeMobile(params.data.mobile);
      }
    }
    const result = await super.update(params);
    return transformEntityMobile(result);
  },

  async updateMany(params: any) {
    if (params?.data && typeof params.data === 'object') {
      if ('mobile' in params.data) {
        params.data.mobile = encodeMobile(params.data.mobile);
      }
    }
    const result = await super.updateMany(params);
    return transformEntitiesMobile(result);
  },

  async delete(params: any) {
    const result = await super.delete(params);
    return transformEntityMobile(result);
  },

  async deleteMany(params: any) {
    const result = await super.deleteMany(params);
    return transformEntitiesMobile(result);
  },
}));
