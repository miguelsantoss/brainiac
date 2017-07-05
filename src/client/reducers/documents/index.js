import _ from 'lodash';
import {
    DOC_FETCH_DOCUMENTS_DB_SUCCESS,
    DOC_FETCH_DOCUMENTS_DB_FAIL,
    DOC_FETCH_DOCUMENTS_DB_LOADING,
    DOC_QUERY_DOCUMENTS_PUBMED_SUCCESS,
    DOC_QUERY_DOCUMENTS_PUBMED_FAIL,
    DOC_QUERY_DOCUMENTS_PUBMED_LOADING,
    DOC_QUERY_DOCUMENT_INFO_PUBMED_SUCCESS,
    DOC_QUERY_DOCUMENT_INFO_PUBMED_FAIL,
    DOC_QUERY_DOCUMENT_INFO_PUBMED_LOADING,
    DB_FILTER_BY_DATE,
    DB_CLEAR_FILTER_BY_DATE,
} from '../../actions/documents';
import { APP_INIT } from '../../actions/common';

export const initialState = {
  documents: [],
  db: {
    documents: {
      cluster_words_lsa: [],
      cluster_words_tfidf: [],
      filter: '',
      nodes: [],
      filteredNodes: [],
      links: [],
      topics_lda: [],
      topics_nmf: [],
    },
    loading: false,
    errorLoading: false,
  },
  query: {
    pubmed: {
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

export function documentDb(state = initialState, action) {
  let documents;
  let f;
  let min;
  let max;
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
      min = action.result[0];
      max = action.result[1];
      f = _.cloneDeep(state.db.documents.nodes).filter((doc) => {
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
    case DB_CLEAR_FILTER_BY_DATE:
      f = _.cloneDeep(state.db.documents.nodes);
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
