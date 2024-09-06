'use client'
import Cookies from 'js-cookie'
import { getInvoiceData } from '@/service/invoice'
import { formatDate, buildAndDownloadFile } from '@/utils'
import { Box, Button, Container, Typography, LinearProgress, Stack, LinearProgressProps } from '@mui/material'
import { useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo'
import { Dayjs } from 'dayjs'
import ErrorDialog from '@/components/error-dialog'

export default function Home() {
    const [percent, setPercent] = useState('0')
    const [disableGetData, setDisableGetData] = useState(false)
    const [fromDate, setFromDate] = useState<Dayjs | null>()
    const [toDate, setToDate] = useState<Dayjs | null>()
    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleError = (errMessage: string) => {
        setErrorMessage(errMessage || 'Có lỗi xảy ra')
        setOpen(true)
    }
    // handle download data
    const getData = () => {
        const from = formatDate(fromDate?.toDate())
        const to = formatDate(toDate?.toDate())

        const token = Cookies.get('token') || ''
        setDisableGetData(true)
        getInvoiceData(token, from, to, setPercent)
            .then((content) => {
                setPercent('0')
                if (content) {
                    buildAndDownloadFile(content || '', from, to)
                } else {
                    handleError('Không có dữ liệu')
                }
            })
            .catch((error: any) => {
                handleError(error.response?.data?.message)
            })
            .finally(() => {
                setDisableGetData(false)
            })
    }

    return (
        <Container
            sx={{
                display: 'flex',
                height: '100vh',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box sx={{ bgcolor: 'white', padding: '2rem', borderRadius: '1rem' }}>
                <Stack spacing={4}>
                    <Typography variant="h4">Lấy dữ liệu hóa đơn</Typography>
                    <DemoContainer components={['DatePicker']}>
                        <DemoItem label="Từ ngày">
                            <DatePicker format="DD/MM/YYYY" value={fromDate} onChange={(v) => setFromDate(v)} />
                        </DemoItem>
                        <DemoItem label="Đến ngày">
                            <DatePicker format="DD/MM/YYYY" value={toDate} onChange={(v) => setToDate(v)} />
                        </DemoItem>
                    </DemoContainer>
                    <Button disabled={disableGetData} onClick={getData} variant="outlined" size="large">
                        Lấy dữ liệu
                    </Button>
                    {disableGetData && <LinearProgressWithLabel value={Number(percent)} />}
                </Stack>
                <ErrorDialog open={open} onClose={() => setOpen(false)} message={errorMessage} />
            </Box>
        </Container>
    )
}

const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{`${props.value}%`}</Typography>
            </Box>
        </Box>
    )
}
