import { 
    DOC_FETCH_DOCUMENTS_DB_SUCCESS,
    DOC_FETCH_DOCUMENTS_DB_FAIL,
    DOC_FETCH_DOCUMENTS_DB_LOADING,
    DOC_QUERY_DOCUMENTS_SCHOLAR_SUCCESS,
    DOC_QUERY_DOCUMENTS_SCHOLAR_FAIL,
    DOC_QUERY_DOCUMENTS_SCHOLAR_LOADING,
    DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS,
    DOC_QUERY_DOCUMENTS_PUBMED_FAIL,
    DOC_QUERY_DOCUMENTS_PUBMED_LOADING
} from 'actions/documents'
import { APP_INIT } from 'actions/common'

export const initialState = {
    documents: [],
    documentDbLoading: false,
    errorLoadingDocDb: false,
    queryRequest: false,
    queryLoading: false,
}

export function documents (state = initialState, action) {
  console.log(state, action);
  switch (action.type) {
    case APP_INIT:
      {
        return {
          ...state,
        }
      }
    case DOC_FETCH_DOCUMENTS_DB_SUCCESS:
      const documents = {...action.result};
      documents.nodes.forEach(d => d.radius = 4);
      documents.filteredNodes = documents.nodes;
      documents.filter = '';
      return {
        ...state,
        documents,
        errorLoadingDocDB: false,
        documentDbLoading: false,
      }
    case DOC_FETCH_DOCUMENTS_DB_FAIL:
      return {
        ...state,
        documents: [],
        errorLoadingDocDB: true,
        documentDbLoading: false,
      }
    case DOC_FETCH_DOCUMENTS_DB_LOADING:
      return {
        ...state,
        documents: [],
        errorLoadingDocDB: false,
        documentDbLoading: true,
      }
    case DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS:
      return {
        ...state,
        queryResult: action.result,
        errorQueryingforDocuments: false,
        queryLoading: false,
        queryRequest: true,
      }
    case DOC_QUERY_DOCUMENTS_PUBMED_FAIL:
      return {
        ...state,
        queryResult: [],
        errorQueryingforDocuments: true,
        queryLoading: false,
        queryRequest: true,
      }
    case DOC_QUERY_DOCUMENTS_PUBMED_LOADING:
      return {
        ...state,
        queryResult: [],
        errorQueryingforDocuments: false,
        queryLoading: true,
        queryRequest: true,
      }
    default:
      return state
  }
}