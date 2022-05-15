import axios from 'lib/axios'
import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { GrDocumentCsv } from 'react-icons/gr'
import { HiOutlineUpload, HiOutlineExclamationCircle } from 'react-icons/hi'
import { IoCloseCircleOutline, IoCloseCircleSharp } from 'react-icons/io5'
import useSWR, { useSWRConfig } from 'swr'

import Button from './Button'

export default function FileUploader() {
    const [files, setFiles] = useState([])
    const [errors, setErrors] = useState([])
    const [filesHasDuplicates, setFilesHasDuplicates] = useState(false)

    const { mutate } = useSWRConfig()

    const onDrop = useCallback(
        acceptedFiles => {
            setFiles(files => {
                return [...files, ...acceptedFiles]
            })
        },
        [files, setFiles],
    )
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
        },
    })

    const csrf = () => axios.get('/sanctum/csrf-cookie')

    useEffect(() => {
        const fileNames = files.map(file => {
            return file.name
        })
        setFilesHasDuplicates(new Set(fileNames).size !== fileNames.length)
    }, [files])

    const filesView = (
        <div className="grid grid-cols-8 gap-4 mt-4">
            {files &&
                files.map((file, index) => {
                    return (
                        <div
                            className="group border border-slate-200 p-6 break-all 
                            relative flex flex-col items-center
                            hover:bg-gray-50
                            "
                            key={index}>
                            <GrDocumentCsv />
                            <span className="text-sm">{file.name}</span>

                            <div
                                className="cursor-pointer text-gray-500  text-xl"
                                onClick={() => removeFile(file)}>
                                <div className="absolute bg-white -top-2 -right-2 visible group-hover:invisible">
                                    <IoCloseCircleOutline />
                                </div>
                                <div className="absolute bg-white -top-2 -right-2 invisible group-hover:visible">
                                    <IoCloseCircleSharp />
                                </div>
                            </div>
                        </div>
                    )
                })}
        </div>
    )

    // action methods
    const handleSubmit = async () => {
        await csrf()
        let formData = new FormData()

        files.forEach(file => {
            formData.append('files[]', file)
        })

        axios
            .post('api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(res => {
                mutate('/api/files')
                setFiles([])
            })
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(Object.values(error.response.data.errors).flat())
            })
    }

    const removeFile = fileToRemove => {
        setFiles(files => {
            return files.filter(file => file != fileToRemove)
        })
    }

    return (
        <div>
            <div
                className="border-2 border-gray-200 border-dashed p-6 text-center bg-gray-50"
                {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="flex justify-center text-gray-500 ">
                    <div className="mx-2">
                        <HiOutlineUpload />
                    </div>
                    {isDragActive ? (
                        <span>Drop the files here ...</span>
                    ) : (
                        <span>Select / Drag and drop files</span>
                    )}
                </div>
            </div>
            {filesView}
            {filesHasDuplicates && (
                <div className="mt-4 p-2 inline-flex items-center bg-orange-600 rounded text-white">
                    <HiOutlineExclamationCircle />
                    <span className="ml-2">
                        Looks like there are duplicates. Please review before
                        uploading.
                    </span>
                </div>
            )}
            {files.length > 0 && (
                <div className="mt-6">
                    <Button onClick={handleSubmit}>
                        Upload For processing
                    </Button>
                </div>
            )}
        </div>
    )
}
