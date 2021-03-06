import FileUpload from '@/components/FileUpload'
import FileUploader from '@/components/FileUploader'
import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import MyTable from '@/components/Table'
import { useEffect } from 'react'
import Echo from 'laravel-echo'
import { mutate } from 'swr'

const Dashboard = () => {
    useEffect(() => {
        window.Pusher = require('pusher-js')

        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
            cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
            wsHost: `127.0.0.1`,
            wsPort: 6001,
            wssport: 6001,
            forceTLS: false,
            disableStats: true,
            transports: ['websocket'],
            enabledTransports: ['ws', 'wss'],
            // authEndpoint: `http://localhost:8008/broadcasting/auth`,
        })

        window.Echo.channel('file-changed').listen('.file.changed', e => {
            mutate('/api/files')
        })
    })
    return (
        <AppLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }>
            <Head>
                <title>Laravel - Dashboard</title>
            </Head>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {/* <FileUpload /> */}
                            <FileUploader />
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <MyTable />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default Dashboard
