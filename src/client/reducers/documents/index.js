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
  let documents;
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
    case DOC_QUERY_DOCUMENT_ABSTRACT_PUBMED_SUCCESS:
      const { id, result } = action.result;
      documents = state.docFetch.pubmed.documents;
      for (let i = 0; i < documents.length; i += 1) {
        if (documents[i].pmid === id) {
          documents[i] = Object.assign({}, documents[i]);
          documents[i].abstract = result;
        }
      }
      return {
        ...state,
        docFetch: {
          pubmed: {
            documents,
            errorLoading: false,
            loading: false,
          },
        },
      };
    case DOC_QUERY_DOCUMENT_ABSTRACT_PUBMED_FAIL:
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
    case DOC_QUERY_DOCUMENT_ABSTRACT_PUBMED_LOADING:
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
    default:
      return state;
  }
}
