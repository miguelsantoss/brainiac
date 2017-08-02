const headers = {
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
};

const defaultGet = {
  headers,
  method: 'GET',
};

export const fetchDocuments = async () =>
  fetch('http://localhost:4000/api/pdf', defaultGet); // eslint-disable-line no-undef

export const searchDocumentsScholar = async query =>
  fetch(`http://localhost:4000/api/search?q=${query}&s=scholar`, defaultGet); // eslint-disable-line no-undef

export const searchDocumentsPubmed = async query =>
  fetch(`http://localhost:4000/api/search?q=${query}&s=pubmed`, defaultGet); // eslint-disable-line no-undef

export const getDocumentInfoPubmed = async pmid =>
  fetch(`http://localhost:4000/api/docinfo?id=${pmid}&s=pubmed`, defaultGet); // eslint-disable-line no-undef

export const updateVisualizationWithDocs = async (pmid, newViz) =>
  fetch(`http://localhost:4000/api/updateviz?${newViz ? 'n=true' : 'n=false'}`, { // eslint-disable-line no-undef
    method: 'post',
    headers,
    body: JSON.stringify(pmid),
  });
