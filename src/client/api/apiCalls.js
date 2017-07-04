// eslint-disable-next-line no-undef
export const fetchDocuments = async () => fetch('http://localhost:4000/pdf');
// eslint-disable-next-line no-undef
export const searchDocumentsScholar = async query => fetch(`http://localhost:4000/search?q=${query}&s=scholar`);
// eslint-disable-next-line no-undef
export const searchDocumentsPubmed = async query => fetch(`http://localhost:4000/search?q=${query}&s=pubmed`);
// eslint-disable-next-line no-undef
export const getDocumentInfoPubmed = async pmid => fetch(`http://localhost:4000/docinfo?id=${pmid}&s=pubmed`);
