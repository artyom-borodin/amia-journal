import apiClient from "./api";
import { APP_CONSTANTS } from "../config/constants";
import { downloadBlob } from "../utils/fileUtils";

export class DocumentService {
  static async _downloadDocument(endpoint, filters, defaultFileName) {
    const response = await apiClient.get(endpoint, {
      params: filters,
      responseType: APP_CONSTANTS.FILES.RESPONSE_TYPE_BLOB,
    });

    const contentDisposition =
      response.headers[APP_CONSTANTS.FILES.CONTENT_DISPOSITION];
    let fileName = defaultFileName;

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(
        APP_CONSTANTS.FILES.FILENAME_REGEX,
      );
      if (
        fileNameMatch &&
        fileNameMatch.length === APP_CONSTANTS.RULES.REGEX_MATCH_LENGTH
      ) {
        fileName = fileNameMatch[1];
      }
    }

    downloadBlob(response.data, fileName);
  }

  static async downloadExaminationSheet(filters) {
    return this._downloadDocument(
      APP_CONSTANTS.API_ENDPOINTS.EXAMINATION_SHEET,
      filters,
      APP_CONSTANTS.FILES.DEFAULT_EXAM_SHEET_NAME,
    );
  }

  static async downloadSummarySheet(filters) {
    return this._downloadDocument(
      APP_CONSTANTS.API_ENDPOINTS.SUMMARY_SHEET,
      filters,
      APP_CONSTANTS.FILES.DEFAULT_SUMMARY_SHEET_NAME,
    );
  }

  static async downloadStudyCardExtract(filters) {
    return this._downloadDocument(
      APP_CONSTANTS.API_ENDPOINTS.STUDY_CARD_EXTRACT,
      filters,
      APP_CONSTANTS.FILES.DEFAULT_STUDY_CARD_EXTRACT_NAME,
    );
  }
}
