import { fetchDocuments, searchDocumentsPubmed, searchDocumentsScholar } from 'api/apiCalls';

export const DOC_FETCH_DOCUMENTS_DB_SUCCESS = 'DOC_FETCH_DOCUMENTS_DB_SUCCESS';
export const DOC_FETCH_DOCUMENTS_DB_FAIL = 'DOC_FETCH_DOCUMENTS_DB_FAIL';

export const DOC_QUERY_DOCUMENTS_SCHOLAR_SUCCESS = 'DOC_QUERY_DOCUMENTS_SCHOLAR_SUCCESS';
export const DOC_QUERY_DOCUMENTS_SCHOLAR_FAIL = 'DOC_QUERY_DOCUMENTS_SCHOLAR_FAIL';
export const DOC_QUERY_DOCUMENTS_SCHOLAR_LOADING = 'DOC_QUERY_DOCUMENTS_SCHOLAR_LOADING';


export const DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS = 'DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS';
export const DOC_QUERY_DOCUMENTS_PUBMED_FAIL = 'DOC_QUERY_DOCUMENTS_PUBMED_FAIL';
export const DOC_QUERY_DOCUMENTS_PUBMED_LOADING = 'DOC_QUERY_DOCUMENTS_PUBMED_LOADING';

export const FETCH_DOCUMENTS = () => {
  return dispatch => {
    dispatch({type: 'DOC_FETCH_DOCUMENTS_DB_LOADING'});
    fetchDocuments().then(response => response.json())
      .then(response => dispatch({type: 'DOC_FETCH_DOCUMENTS_DB_SUCCESS', result: response}))
      .catch(err => dispatch({type: 'DOC_FETCH_DOCUMENTS_DB_FAIL', result: err}));
  }
}

export const QUERY_DOCUMENTS_SCHOLAR = query => {
  return dispatch => {
    searchDocumentsScholar(query).then(response => response.json())
      .then(response => dispatch({type: 'DOC_QUERY_DOCUMENTS_SCHOLAR_SUCCESS', result: response}))
      .catch(err => dispatch({type: 'DOC_QUERY_DOCUMENTS_SCHOLAR_FAIL', result: err}));
  }
}

export const QUERY_DOCUMENTS_PUBMED = query => {
  return dispatch => {
    dispatch({type: 'DOC_QUERY_DOCUMENTS_PUBMED_LOADING'});
    searchDocumentsPubmed(query).then(response => response.json())
      .then(response => dispatch({type: 'DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS', result: response}))
      .catch(err => dispatch({type: 'DOC_QUERY_DOCUMENTS_PUBMED_FAIL', result: err}));
  }
}