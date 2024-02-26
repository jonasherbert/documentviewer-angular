export type AnnotationProperties = {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    page?: number;
    description?: string;
    placeholder?: string;
    fontSize?: number;
    mandatory?: boolean;
    value?: string;
    type: ActionType;
    id: string;
};

export enum ActionType {
    SIGNATURE_FIELD = "signatureField",
    TEXT_FIELD = "textField",
    DOCUMENT_INITIAL = "documentInitial",
    INVISIBLE_SIGNATURE = "invisibleSignature",
    MARK_AS_READ = "markAsRead",
}
