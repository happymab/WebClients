import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { initUpload, UploadCallbacks, UploadControls } from './upload';
import { TransferState, TransferProgresses, TransferMeta } from '../../interfaces/transfer';

export interface BlockMeta {
    Index: number;
    Hash: string;
    Token: string;
}

export interface UploadInfo {
    blob: Blob;
    LinkID: string;
    ShareID: string;
    RevisionID: string;
    ParentLinkID: string;
}

export interface Upload {
    id: string;
    meta: TransferMeta;
    info: UploadInfo;
    state: TransferState;
    startDate: Date;
}

interface UploadProviderState {
    uploads: Upload[];
    addToUploadQueue: (meta: TransferMeta, info: UploadInfo, callbacks: UploadCallbacks) => void;
    getUploadsProgresses: () => TransferProgresses;
    clearUploads: () => void;
}

const MAX_ACTIVE_UPLOADS = 3;

const UploadContext = createContext<UploadProviderState | null>(null);

interface UserProviderProps {
    children: React.ReactNode;
}

export const UploadProvider = ({ children }: UserProviderProps) => {
    const [uploads, setUploads] = useState<Upload[]>([]);
    const controls = useRef<{ [id: string]: UploadControls }>({});
    const progresses = useRef<TransferProgresses>({});

    const updateUploadState = (id: string, state: TransferState) => {
        setUploads((uploads) => uploads.map((upload) => (upload.id === id ? { ...upload, state } : upload)));
    };

    useEffect(() => {
        const activeUploads = uploads.filter(({ state }) => state === TransferState.Progress);
        const nextPending = uploads.find(({ state }) => state === TransferState.Pending);

        if (activeUploads.length < MAX_ACTIVE_UPLOADS && nextPending) {
            const { id, info } = nextPending;

            updateUploadState(id, TransferState.Progress);

            controls.current[id]
                .start(info)
                .then(() => {
                    // Update upload progress to 100%
                    const upload = uploads.find((upload) => upload.id === id);
                    if (upload) {
                        progresses.current[id] = upload.meta.size;
                    }
                    updateUploadState(id, TransferState.Done);
                })
                .catch((err) => {
                    console.error(err);
                    updateUploadState(id, TransferState.Error);
                });
        }
    }, [uploads]);

    const addToUploadQueue = (meta: TransferMeta, info: UploadInfo, callbacks: UploadCallbacks) => {
        const { id, uploadControls } = initUpload({
            ...callbacks,
            onProgress: (bytes) => {
                progresses.current[id] += bytes;
                callbacks.onProgress?.(bytes);
            }
        });

        controls.current[id] = uploadControls;
        progresses.current[id] = 0;

        setUploads((uploads) => [
            ...uploads,
            {
                id,
                meta,
                info,
                state: TransferState.Pending,
                startDate: new Date()
            }
        ]);
    };

    const getUploadsProgresses = () => ({ ...progresses.current });
    const clearUploads = () => {
        // TODO: cancel pending downloads when implementing reject
        setUploads([]);
    };

    return (
        <UploadContext.Provider
            value={{
                uploads,
                addToUploadQueue,
                getUploadsProgresses,
                clearUploads
            }}
        >
            {children}
        </UploadContext.Provider>
    );
};

export const useUploadProvider = (): UploadProviderState => {
    const state = useContext(UploadContext);
    if (!state) {
        throw new Error('Trying to use uninitialized UploadProvider');
    }
    return state;
};
