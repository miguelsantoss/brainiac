const headers = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
};

const defaultGet = {
  headers,
  method: 'GET',
};

export const fetchDocuments = async () => fetch('/api/pdf', defaultGet);

export const searchDocumentsScholar = async query =>
  fetch(`/api/search?q=${query}&s=scholar`, defaultGet);

export const searchDocumentsPubmed = async query =>
  fetch(`/api/search?q=${query}&s=pubmed`, defaultGet);

export const getDocumentInfoPubmed = async pmid =>
  fetch(`/api/docinfo?id=${pmid}&s=pubmed`, defaultGet);

export const updateVisualizationWithDocs = async (pmid, newViz) =>
  fetch(`/api/update-viz/create?${newViz ? 'n=true' : 'n=false'}`, {
    method: 'post',
    headers,
    body: JSON.stringify(pmid),
  });

export const getWordDistances = async word =>
  fetch(`/api/update-viz/word?w=${word}`, {
    method: 'post',
    headers,
  });
