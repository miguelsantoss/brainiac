import {
  fetchDocuments,
  searchDocumentsPubmed,
  searchDocumentsScholar,
  getDocumentInfoPubmed,
  updateVisualizationWithDocs,
} from '../../api/apiCalls';

export const DOC_FETCH_DOCUMENTS_DB_SUCCESS = 'DOC_FETCH_DOCUMENTS_DB_SUCCESS';
export const DOC_FETCH_DOCUMENTS_DB_LOADING = 'DOC_FETCH_DOCUMENTS_DB_LOADING';
export const DOC_FETCH_DOCUMENTS_DB_FAIL = 'DOC_FETCH_DOCUMENTS_DB_FAIL';

export const DOC_QUERY_DOCUMENTS_SCHOLAR_SUCCESS = 'DOC_QUERY_DOCUMENTS_SCHOLAR_SUCCESS';
export const DOC_QUERY_DOCUMENTS_SCHOLAR_FAIL = 'DOC_QUERY_DOCUMENTS_SCHOLAR_FAIL';
export const DOC_QUERY_DOCUMENTS_SCHOLAR_LOADING = 'DOC_QUERY_DOCUMENTS_SCHOLAR_LOADING';

export const DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS = 'DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS';
export const DOC_QUERY_DOCUMENTS_PUBMED_FAIL = 'DOC_QUERY_DOCUMENTS_PUBMED_FAIL';
export const DOC_QUERY_DOCUMENTS_PUBMED_LOADING = 'DOC_QUERY_DOCUMENTS_PUBMED_LOADING';

export const DOC_QUERY_DOCUMENT_INFO_PUBMED_SUCCESS = 'DOC_QUERY_DOCUMENT_INFO_PUBMED_SUCCESS';
export const DOC_QUERY_DOCUMENT_INFO_PUBMED_FAIL = 'DOC_QUERY_DOCUMENT_INFO_PUBMED_FAIL';
export const DOC_QUERY_DOCUMENT_INFO_PUBMED_LOADING = 'DOC_QUERY_DOCUMENT_INFO_PUBMED_LOADING';

export const DB_FILTER_BY_DATE = 'DB_FILTER_BY_DATE';
export const DB_CLEAR_FILTER_BY_DATE = 'DB_CLEAR_FILTER_BY_DATE';

export const DB_UPDATE_VISUALIZATION_WITH_DOCS_SUCCESS = 'DB_UPDATE_VISUALIZATION_WITH_DOCS_SUCCESS';
export const DB_UPDATE_VISUALIZATION_WITH_DOCS_FAIL = 'DB_UPDATE_VISUALIZATION_WITH_DOCS_FAIL';
export const DB_UPDATE_VISUALIZATION_WITH_DOCS_LOADING = 'DB_UPDATE_VISUALIZATION_WITH_DOCS_LOADING';

export const DB_SORT_DOCUMENTS_BY = 'DB_SORT_DOCUMENTS_BY';
export const DB_FILTER_DOCUMENTS = 'DB_FILTER_DOCUMENTS';

export const FETCH_DOCUMENTS = () =>
  (dispatch) => {
    dispatch({ type: DOC_FETCH_DOCUMENTS_DB_LOADING });
    fetchDocuments().then(response => response.json())
      .then(response => dispatch({ type: DOC_FETCH_DOCUMENTS_DB_SUCCESS, result: response }))
      .catch(err => dispatch({ type: DOC_FETCH_DOCUMENTS_DB_FAIL, result: err }));
  };

export const QUERY_DOCUMENTS_SCHOLAR = query =>
  (dispatch) => {
    searchDocumentsScholar(query).then(response => response.json())
      .then(response => dispatch({ type: DOC_QUERY_DOCUMENTS_SCHOLAR_SUCCESS, result: response }))
      .catch(err => dispatch({ type: DOC_QUERY_DOCUMENTS_SCHOLAR_FAIL, result: err }));
  };

export const QUERY_DOCUMENTS_PUBMED = query =>
  (dispatch) => {
    dispatch({ type: DOC_QUERY_DOCUMENTS_PUBMED_LOADING });
    searchDocumentsPubmed(query).then(response => response.json())
      .then(response => dispatch({ type: DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS, result: response }))
      .catch(err => dispatch({ type: DOC_QUERY_DOCUMENTS_PUBMED_FAIL, result: err }));
  };

export const QUERY_DOCUMENT_INFO_PUBMED = pmid =>
  (dispatch) => {
    dispatch({ type: DOC_QUERY_DOCUMENT_INFO_PUBMED_LOADING });
    getDocumentInfoPubmed(pmid).then(response => response.json())
      .then(response => dispatch({ type: DOC_QUERY_DOCUMENT_INFO_PUBMED_SUCCESS, result: response }))
      .catch(err => dispatch({ type: DOC_QUERY_DOCUMENT_INFO_PUBMED_FAIL, result: err }));
  };

export const FILTER_BY_DATE = dates =>
  (dispatch) => {
    dispatch({ type: DB_FILTER_BY_DATE, result: dates });
  };

export const CLEAR_FILTER_BY_DATE = dates =>
  (dispatch) => {
    dispatch({ type: DB_CLEAR_FILTER_BY_DATE, result: dates });
  };

export const UPDATE_VISUALIZATION_WITH_DOCS = (docs, newViz) =>
  (dispatch) => {
    dispatch({ type: DB_UPDATE_VISUALIZATION_WITH_DOCS_LOADING });
    updateVisualizationWithDocs(docs, newViz).then(response => response.json())
      .then(response => dispatch({ type: DB_UPDATE_VISUALIZATION_WITH_DOCS_SUCCESS, result: response }))
      .catch(err => dispatch({ type: DB_UPDATE_VISUALIZATION_WITH_DOCS_FAIL, result: err }));
  };

export const SORT_DOCUMENTS_BY = sortKey =>
  (dispatch) => {
    dispatch({ type: DB_SORT_DOCUMENTS_BY, result: sortKey });
  };

export const FILTER_DOCUMENTS = query =>
  (dispatch) => {
    dispatch({ type: DB_FILTER_DOCUMENTS, result: query });
  };
