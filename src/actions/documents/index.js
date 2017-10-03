import * as ACTIONS from '../constants';

import {
  fetchDocuments,
  searchDocumentsPubmed,
  searchDocumentsScholar,
  getDocumentInfoPubmed,
  updateVisualizationWithDocs,
  getWordDistances,
} from '../../api/apiCalls';

export const FETCH_DOCUMENTS = () => dispatch => {
  dispatch({ type: ACTIONS.DOC_FETCH_DOCUMENTS_DB_LOADING });
  fetchDocuments()
    .then(response => response.json())
    .then(response =>
      dispatch({
        type: ACTIONS.DOC_FETCH_DOCUMENTS_DB_SUCCESS,
        result: response,
      }),
    )
    .catch(err =>
      dispatch({
        type: ACTIONS.DOC_FETCH_DOCUMENTS_DB_FAIL,
        result: err,
      }),
    );
};

export const QUERY_DOCUMENTS_SCHOLAR = query => dispatch => {
  searchDocumentsScholar(query)
    .then(response => response.json())
    .then(response =>
      dispatch({
        type: ACTIONS.DOC_QUERY_DOCUMENTS_SCHOLAR_SUCCESS,
        result: response,
      }),
    )
    .catch(err =>
      dispatch({ type: ACTIONS.DOC_QUERY_DOCUMENTS_SCHOLAR_FAIL, result: err }),
    );
};

export const QUERY_DOCUMENTS_PUBMED = query => dispatch => {
  dispatch({ type: ACTIONS.DOC_QUERY_DOCUMENTS_PUBMED_LOADING });
  searchDocumentsPubmed(query)
    .then(response => response.json())
    .then(response =>
      dispatch({
        type: ACTIONS.DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS,
        result: response,
      }),
    )
    .catch(err =>
      dispatch({ type: ACTIONS.DOC_QUERY_DOCUMENTS_PUBMED_FAIL, result: err }),
    );
};

export const QUERY_DOCUMENT_INFO_PUBMED = pmid => dispatch => {
  dispatch({ type: ACTIONS.DOC_QUERY_DOCUMENT_INFO_PUBMED_LOADING });
  getDocumentInfoPubmed(pmid)
    .then(response => response.json())
    .then(response =>
      dispatch({
        type: ACTIONS.DOC_QUERY_DOCUMENT_INFO_PUBMED_SUCCESS,
        result: response,
      }),
    )
    .catch(err =>
      dispatch({
        type: ACTIONS.DOC_QUERY_DOCUMENT_INFO_PUBMED_FAIL,
        result: err,
      }),
    );
};

export const FILTER_BY_DATE = dates => dispatch => {
  dispatch({ type: ACTIONS.DB_FILTER_BY_DATE, result: dates });
};

export const CLEAR_FILTER_BY_DATE = dates => dispatch => {
  dispatch({ type: ACTIONS.DB_CLEAR_FILTER_BY_DATE, result: dates });
};

export const UPDATE_VISUALIZATION_WITH_DOCS = (docs, newViz) => dispatch => {
  dispatch({ type: ACTIONS.DB_UPDATE_VISUALIZATION_WITH_DOCS_LOADING });
  updateVisualizationWithDocs(docs, newViz)
    .then(response => response.json())
    .then(response =>
      dispatch({
        type: ACTIONS.DB_UPDATE_VISUALIZATION_WITH_DOCS_SUCCESS,
        result: response,
      }),
    )
    .catch(err =>
      dispatch({
        type: ACTIONS.DB_UPDATE_VISUALIZATION_WITH_DOCS_FAIL,
        result: err,
      }),
    );
};

export const SORT_DOCUMENTS_BY = sortKey => dispatch => {
  dispatch({ type: ACTIONS.DB_SORT_DOCUMENTS_BY, result: sortKey });
};

export const FILTER_DOCUMENTS = query => dispatch => {
  dispatch({ type: ACTIONS.DB_FILTER_DOCUMENTS, result: query });
};

export const GET_WORD_DISTANCE = word => dispatch => {
  dispatch({ type: ACTIONS.DB_UPDATE_GET_WORD_DISTANCE_LOADING });
  getWordDistances(word)
    .then(response => response.json())
    .then(response =>
      dispatch({
        type: ACTIONS.DB_UPDATE_GET_WORD_DISTANCE_SUCCESS,
        result: response,
      }),
    )
    .catch(err =>
      dispatch({
        type: ACTIONS.DB_UPDATE_GET_WORD_DISTANCE_FAIL,
        result: err,
      }),
    );
};
