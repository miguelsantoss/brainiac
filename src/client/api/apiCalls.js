export const fetchDocuments = async () => fetch('http://localhost:4000/pdf');
export const searchDocumentsScholar = async query => fetch(`http://localhost:4000/search?q=${query}&s=scholar`);
export const searchDocumentsPubmed = async query => fetch(`http://localhost:4000/search?q=${query}&s=pubmed`);
export const getDocumentInfoPubmed = async pmid => fetch(`http://localhost:4000/docinfo?id=${pmid}&s=pubmed`);
export const getDocumentAbstractPubmed = async pmid => fetch(`http://localhost:4000/abstract?id=${pmid}&s=pubmed`);
