class KnowledgeProcessingError(Exception):
    """Base exception for all document processing errors"""
    pass

class UnsupportedFileTypeError(KnowledgeProcessingError):
    """Raised when the file type has no matching processor"""
    pass

class FileStructureCorruptedError(KnowledgeProcessingError):
    """Raised when a file cannot be parsed due to corruption"""
    pass
