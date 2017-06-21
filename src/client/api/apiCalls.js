export const fetchDocuments = async () => fetch(`http://localhost:4000/pdf`);
export const searchDocumentsScholar = async query => fetch(`http://localhost:4000/search?q=${query}&s=scholar`);
export const searchDocumentsPubmed = async query => fetch(`http://localhost:4000/search?q=${query}&s=pubmed`);