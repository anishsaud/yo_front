import Dropzone from 'react-dropzone-uploader'
import { getDroppedOrSelectedFiles } from 'html5-file-selector'
import Button from './Button'
import axios from 'lib/axios'

const Layout = ({
    input,
    previews,
    submitButton,
    dropzoneProps,
    files,
    extra: { maxFiles },
}) => {
    return (
        <div className="">
            <div {...dropzoneProps}>{files.length < maxFiles && input}</div>

            <div className="my-4">
                <div>Uploaded files (ready for processing)</div>
                <div className="flex justify-start items-center ">
                    {previews}
                </div>
            </div>

            {files.length > 0 && submitButton}
        </div>
    )
}

const SubmitButton = ({ className, style, disabled, onSubmit, files }) => {
    const _disabled =
        files.some(f =>
            ['preparing', 'getting_upload_params', 'uploading'].includes(
                f.meta.status,
            ),
        ) ||
        !files.some(f => ['headers_received', 'done'].includes(f.meta.status))

    const handleSubmit = () => {
        onSubmit(
            files.filter(f =>
                ['headers_received', 'done'].includes(f.meta.status),
            ),
        )
    }

    return (
        <div className="mt-6" style={style}>
            <Button onClick={handleSubmit} disabled={disabled || _disabled}>
                Submit For processing
            </Button>
        </div>
    )
}

const Preview = ({
    meta,
    fileWithMeta,
    isUpload,
    canCancel,
    canRestart,
    canRemove,
}) => {
    const { name, percent, status } = meta
    const { cancel, remove, restart } = fileWithMeta

    return (
        <div className="border border-slate-200 p-6 my-4 mr-5 relative">
            {name && (
                <span>
                    {name} ({Math.round(percent)}%)
                </span>
            )}

            {status === 'uploading' && canCancel && (
                <span className="dzu-previewButton" onClick={cancel}>
                    {`Pause`}
                </span>
            )}
            {status !== 'preparing' &&
                status !== 'getting_upload_params' &&
                status !== 'uploading' &&
                canRemove && (
                    <Button
                        type="button"
                        className="absolute -top-5 rounded-full"
                        onClick={remove}>
                        x
                    </Button>
                )}
            {[
                'error_upload_params',
                'exception_upload',
                'error_upload',
                'aborted',
                'ready',
            ].includes(status) &&
                canRestart && (
                    <span className="dzu-previewButton" onClick={restart} />
                )}
        </div>
    )
}

const Input = ({ accept, onFiles, files, getFilesFromEvent }) => {
    const text = files.length > 0 ? 'Add more files' : 'Choose files'

    return (
        <label className="flex justify-between items-center bg-white overflow-hidden border-2 border-dashed border-gray-200 p-6">
            <div>Select / Drag & drop files</div>
            <label className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150">
                {text}
                <input
                    style={{ display: 'none' }}
                    type="file"
                    accept={accept}
                    multiple
                    onChange={e => {
                        getFilesFromEvent(e).then(chosenFiles => {
                            onFiles(chosenFiles)
                        })
                    }}
                />
            </label>
        </label>
    )
}

export default function FileUpload() {
    const getUploadParams = ({ meta }) => {
        return {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                ...axios.defaults.headers.common,
            },
            withCredentials: true,
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/upload`,
        }
    }

    const handleChangeStatus = ({ meta, file }, status) => {
        console.log(status, meta, file)
    }

    const handleSubmit = (files, allFiles) => {
        console.log(
            'submit',
            files.map(f => f.meta),
        )
        allFiles.forEach(f => f.remove())
    }
    const getFilesFromEvent = e => {
        return new Promise(resolve => {
            getDroppedOrSelectedFiles(e).then(chosenFiles => {
                resolve(chosenFiles.map(f => f.fileObject))
            })
        })
    }

    return (
        <Dropzone
            LayoutComponent={Layout}
            PreviewComponent={Preview}
            InputComponent={Input}
            SubmitButtonComponent={SubmitButton}
            getUploadParams={getUploadParams}
            onChangeStatus={handleChangeStatus}
            onSubmit={handleSubmit}
            getFilesFromEvent={getFilesFromEvent}
            accept=".csv"
        />
    )
}
