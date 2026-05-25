import apiClient, { fetchAllPages } from "./api";

export class CrudService {
  static _formatEndpoint(endpoint) {
    return endpoint.endsWith("/") ? endpoint : `${endpoint}/`;
  }

  static async getAll(endpoint, params = {}) {
    return await fetchAllPages(this._formatEndpoint(endpoint), params);
  }

  static async create(endpoint, data) {
    const response = await apiClient.post(this._formatEndpoint(endpoint), data);
    return response.data;
  }

  static async update(endpoint, id, data) {
    const url = `${this._formatEndpoint(endpoint)}${id}/`;
    const response = await apiClient.put(url, data);
    return response.data;
  }

  static async delete(endpoint, id) {
    const url = `${this._formatEndpoint(endpoint)}${id}/`;
    const response = await apiClient.delete(url);
    return response.data;
  }
}
