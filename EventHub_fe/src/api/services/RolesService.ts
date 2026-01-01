import type { Role } from '../models/Role';
import { request as __request } from '../core/request';
import { OpenAPI } from '../core/OpenAPI';
import type { CancelablePromise } from '../core/CancelablePromise';

export class RolesService {
  public static getApiAdminRoles(): CancelablePromise<Array<Role>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/admin/roles',
    });
  }
}
