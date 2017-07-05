import _ from 'lodash';
import { 
    DOC_FETCH_DOCUMENTS_DB_SUCCESS,
    DOC_FETCH_DOCUMENTS_DB_FAIL,
    DOC_FETCH_DOCUMENTS_DB_LOADING,
    DOC_QUERY_DOCUMENTS_SCHOLAR_SUCCESS,
    DOC_QUERY_DOCUMENTS_SCHOLAR_FAIL,
    DOC_QUERY_DOCUMENTS_SCHOLAR_LOADING,
    DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS,
    DOC_QUERY_DOCUMENTS_PUBMED_FAIL,
    DOC_QUERY_DOCUMENTS_PUBMED_LOADING,
    DOC_QUERY_DOCUMENT_INFO_PUBMED_SUCCESS,
    DOC_QUERY_DOCUMENT_INFO_PUBMED_FAIL,
    DOC_QUERY_DOCUMENT_INFO_PUBMED_LOADING,
    DOC_QUERY_DOCUMENT_ABSTRACT_PUBMED_SUCCESS,
    DOC_QUERY_DOCUMENT_ABSTRACT_PUBMED_FAIL,
    DOC_QUERY_DOCUMENT_ABSTRACT_PUBMED_LOADING,
    DB_FILTER_BY_DATE,
} from 'actions/documents';
import { APP_INIT } from 'actions/common';

export const initialState = {
  documents: [],
  documentDbLoading: false,
  errorLoadingDocDb: false,
  queryRequest: false,
  queryLoading: false,
  db: {
    documents: {},
    loading: false,
    errorLoading: false,
  },
  query: {
    pubmed: {
      request: false,
      loading: false,
      errorLoading: false,
      results: [],
    },
  },
  docFetch: {
    pubmed: {
      documents: [],
      loading: false,
      errorLoading: false,
    },
  },
};

export function documents (state = initialState, action) {
  let documents, id, result;
  switch (action.type) {
    case APP_INIT:
      return {
        ...state,
      };
    case DOC_FETCH_DOCUMENTS_DB_SUCCESS:
      documents = { ...action.result };
      documents.nodes.forEach((d) => { d.radius = 4; });
      documents.filteredNodes = [...documents.nodes];
      documents.filter = '';
      return {
        ...state,
        db: {
          documents,
          errorLoading: false,
          loading: false,
        },
      };
    case DOC_FETCH_DOCUMENTS_DB_FAIL:
      return {
        ...state,
        db: {
          documents: {},
          errorLoading: true,
          loading: false,
        },
      };
    case DOC_FETCH_DOCUMENTS_DB_LOADING:
      return {
        ...state,
        db: {
          documents: {},
          errorLoading: false,
          loading: true,
        },
      };
    case DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS:
      return {
        ...state,
        query: {
          pubmed: {
            results: action.result,
            errorLoading: false,
            loading: false,
          },
        },
      };
    case DOC_QUERY_DOCUMENTS_PUBMED_FAIL:
      return {
        ...state,
        query: {
          pubmed: {
            ...state.query.pubmed,
            errorLoading: true,
            loading: false,
          },
        },
      };
    case DOC_QUERY_DOCUMENTS_PUBMED_LOADING:
      return {
        ...state,
        query: {
          pubmed: {
            ...state.query.pubmed,
            errorLoading: false,
            loading: true,
          },
        },
      };
    case DOC_QUERY_DOCUMENT_INFO_PUBMED_SUCCESS:
      return {
        ...state,
        docFetch: {
          pubmed: {
            documents: [...state.docFetch.pubmed, action.result],
            errorLoading: false,
            loading: false,
          },
        },
      };
    case DOC_QUERY_DOCUMENT_INFO_PUBMED_FAIL:
      return {
        ...state,
        docFetch: {
          pubmed: {
            ...state.docFetch.pubmed,
            errorLoading: true,
            loading: false,
          },
        },
      };
    case DOC_QUERY_DOCUMENT_INFO_PUBMED_LOADING:
      return {
        ...state,
        docFetch: {
          pubmed: {
            ...state.docFetch.pubmed,
            errorLoading: false,
            loading: true,
          },
        },
      };
    case DB_FILTER_BY_DATE:
      const min = action.result[0];
      const max = action.result[1];
      const f = _.cloneDeep(state.db.documents.nodes).filter(doc => {
        const date = parseInt(doc.date.slice(0, 4), 10);
        if (date >= min && date <= max) {
          return true;
        }
        return false;
      });
      return {
        ...state,
        db: {
          ...state.db,
          documents: {
            ...state.db.documents,
            filteredNodes: f,
          },
        },
      };
    default:
      return state;
  }
}
