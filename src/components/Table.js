import Table from 'react-data-table-component'
import useSWR from 'swr'
import axios from 'lib/axios'
import { useState, useEffect } from 'react'

export default function DataTable({}) {
    // const [files, setFiles] = useState([])

    const { data: files, error, mutate } = useSWR('/api/files', () =>
        axios
            .get('/api/files')
            .then(res => res.data.data)
            .catch(error => {
                if (error.response.status !== 409) throw error

                console.log(error)
            }),
    )

    // useEffect(async () => {
    //     await csrf()
    //     await axios
    //         .get('api/files/', { params: { sort: '-created_at' } })
    //         .then(res => {
    //             console.log(res.data.data)
    //             setFiles(res.data.data)
    //         })
    //         .catch(err => {
    //             console.log(err)
    //         })
    // }, [setFiles])

    const columns = [
        {
            selector: 'created_at',
            name: 'Time',
            sortable: true,
            cell: row => {
                return (
                    <div>
                        {row.created_at} <br /> {row.created_at_diff}
                    </div>
                )
            },
        },
        {
            selector: 'original_name',
            name: 'Name',
            sortable: true,
        },
        {
            selector: 'status',
            name: 'Status',
            cell: row => {
                return (
                    <div>
                        {row.status == 'PENDING' && (
                            <span
                                className="px-4 py-2 rounded-full 
                            text-gray-500 bg-gray-200 
                            text-sm flex align-center ">
                                {row.status}
                            </span>
                        )}
                        {row.status == 'PROCESSING' && (
                            <span
                                className="px-4 py-2 rounded-full 
                                text-gray-500 bg-green-300 
                            text-sm flex align-center ">
                                {row.status}
                            </span>
                        )}
                        {row.status == 'COMPLETED' && (
                            <span
                                className="px-4 py-2 rounded-full 
                            text-gray-500 bg-green-600 
                            text-sm flex align-center ">
                                {row.status}
                            </span>
                        )}
                        {row.status == 'FAILED' && (
                            <span
                                className="px-4 py-2 rounded-full 
                            text-gray-100 bg-red-600 
                            text-sm flex align-center ">
                                {row.status}
                            </span>
                        )}
                    </div>
                )
            },
        },
    ]

    const rowRender = (row, column, display_value) => {
        if (column.field === 'created_at') {
            return (
                <div>
                    {row.created_at} <br /> {row.created_at_diff}
                </div>
            )
        }

        return display_value
    }

    return <Table columns={columns} data={files} />
}
