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
  DB_UPDATE_VISUALIZATION_WITH_DOCS_SUCCESS,
  DB_UPDATE_VISUALIZATION_WITH_DOCS_FAIL,
  DB_UPDATE_VISUALIZATION_WITH_DOCS_LOADING,
  DB_SORT_DOCUMENTS_BY,
  DB_FILTER_DOCUMENTS,
  DB_UPDATE_GET_WORD_DISTANCE_SUCCESS,
  DB_UPDATE_GET_WORD_DISTANCE_FAIL,
  DB_UPDATE_GET_WORD_DISTANCE_LOADING,
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
      wordMagnets: [],
      wordDistances: {},
      wordDistancesWLabels: {},
      wordLoading: false,
      wordError: false,
    },
    loading: false,
    errorLoading: false,
    queryResult: false,
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
  let query;
  let filtered;
  let wordValues;
  let wordValuesLabels;
  let wordMagnets;
  switch (action.type) {
    case APP_INIT:
      return {
        ...state,
      };
    case DOC_FETCH_DOCUMENTS_DB_SUCCESS:
      documents = { ...action.result };
      documents.nodes.forEach(d => {
        d.radius = 4;
        d.defaultRadius = 4;
      });
      documents.filter = '';
      documents.nodes.sort((a, b) => {
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
      });
      f = _.cloneDeep(documents.nodes);
      documents.filteredNodes = f;
      return {
        ...state,
        db: {
          ...state.db,
          documents,
          errorLoading: false,
          loading: false,
        },
      };
    case DOC_FETCH_DOCUMENTS_DB_FAIL:
      return {
        ...state,
        db: {
          ...state.db,
          documents: {},
          errorLoading: true,
          loading: false,
        },
      };
    case DOC_FETCH_DOCUMENTS_DB_LOADING:
      return {
        ...state,
        db: {
          ...state.db,
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
      f = _.cloneDeep(state.db.documents.nodes).filter(doc => {
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
    case DB_UPDATE_VISUALIZATION_WITH_DOCS_SUCCESS:
      documents = { ...action.result };
      documents.nodes.forEach(d => {
        d.radius = 4;
        d.defaultRadius = 4;
      });
      documents.filter = '';
      documents.nodes.sort((a, b) => {
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
      });
      f = _.cloneDeep(documents.nodes);
      documents.filteredNodes = f;
      return {
        ...state,
        db: {
          documents,
          errorLoading: false,
          loading: false,
          queryResult: true,
        },
      };
    case DB_UPDATE_VISUALIZATION_WITH_DOCS_FAIL:
      return {
        ...state,
        db: {
          ...state.db,
          errorLoading: true,
          loading: false,
        },
      };
    case DB_UPDATE_VISUALIZATION_WITH_DOCS_LOADING:
      return {
        ...state,
        db: {
          ...state.db,
          errorLoading: false,
          loading: true,
        },
      };
    case DB_SORT_DOCUMENTS_BY:
      f = _.cloneDeep(state.db.documents.nodes);
      if (action.result === 'Title') {
        f.sort((a, b) => {
          if (a.title < b.title) return -1;
          if (a.title > b.title) return 1;
          return 0;
        });
      } else if (action.result === 'Date') {
        f.sort((a, b) => {
          if (a.date.substring(0, 4) < b.date.substring(0, 4)) return -1;
          if (a.date.substring(0, 4) > b.date.substring(0, 4)) return 1;
          return 0;
        });
      }
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
    case DB_FILTER_DOCUMENTS:
      query = action.result;
      filtered = _.cloneDeep(state.db.documents.nodes).filter(node =>
        node.title.toLowerCase().includes(query),
      );
      return {
        ...state,
        db: {
          ...state.db,
          documents: {
            ...state.db.documents,
            filteredNodes: filtered,
          },
        },
      };
    case DB_UPDATE_GET_WORD_DISTANCE_LOADING:
      return {
        ...state,
        db: {
          ...state.db,
          documents: {
            ...state.db.documents,
            wordLoading: true,
            wordError: false,
          },
        },
      };
    case DB_UPDATE_GET_WORD_DISTANCE_SUCCESS:
      wordValues = _.cloneDeep(state.db.documents.wordDistances);
      wordValuesLabels = _.cloneDeep(state.db.documents.wordDistancesWLabels);
      wordMagnets = _.cloneDeep(state.db.documents.wordMagnets);
      Object.keys(action.result).forEach(key => {
        wordValues[key] = action.result[key].array;
        wordValuesLabels[key] = action.result[key].labels;
        wordMagnets.push(key);
      });
      return {
        ...state,
        db: {
          ...state.db,
          documents: {
            ...state.db.documents,
            wordDistances: wordValues,
            wordDistancesWLabels: wordValuesLabels,
            wordMagnets,
            wordLoading: false,
            wordError: false,
          },
        },
      };
    case DB_UPDATE_GET_WORD_DISTANCE_FAIL:
      return {
        ...state,
        db: {
          ...state.db,
          documents: {
            ...state.db.documents,
            wordLoading: false,
            wordError: true,
          },
        },
      };
    default:
      return state;
  }
}
