'use client'
import { getInvoiceData } from '@/service/invoice'
import { buildAndDownloadFile, getStartDate, getEndDate } from '@/utils'
import { Box, Button, Container, Typography, LinearProgress, Stack, LinearProgressProps } from '@mui/material'
import { useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo'
import { Dayjs } from 'dayjs'
import ErrorDialog from '@/components/error-dialog'
import Cookies from 'js-cookie'
import { PiSignOutFill } from 'react-icons/pi'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()
    const [percent, setPercent] = useState('0')
    const [disableGetData, setDisableGetData] = useState(false)
    const [fromDate, setFromDate] = useState<Dayjs | null>()
    const [toDate, setToDate] = useState<Dayjs | null>()
    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const user = Cookies.get('username')

    const handleError = (errMessage: string) => {
        setErrorMessage(errMessage || 'Có lỗi xảy ra')
        setOpen(true)
    }

    // handle download data
    const getData = async () => {
        const startDate = getStartDate(fromDate?.format('DD-MM-YYYY') || '')
        const endDate = getEndDate(toDate?.format('DD-MM-YYYY') || '')

        if (!startDate || !endDate) {
            handleError('Vui lòng chọn ngày')
            return
        }

        setDisableGetData(true)
        try {
            const content = await getInvoiceData(startDate, endDate, setPercent)
            setPercent('0')

            if (content) {
                buildAndDownloadFile(content || '', startDate, endDate)
            } else {
                handleError('Không có dữ liệu')
            }
        } catch (error: any) {
            console.log(error)
            handleError(error.response?.data?.message)
        } finally {
            setDisableGetData(false)
        }
    }

    const handleLogout = () => {
        Cookies.remove('token')
        Cookies.remove('username')
        router.push('/login')
    }

    return (
        <>
            <Container
                sx={{
                    display: 'flex',
                    height: '100vh',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ bgcolor: 'white', padding: '2rem', borderRadius: '1rem', position: 'relative' }}>
                    <Box display="flex" position="absolute" top={-100} left={0} width="100%" alignItems="center" gap={2}>
                        <Box display="inline-flex" alignItems="center" gap={2}>
                            <Typography variant="h4" textAlign="center">
                                Xin chào {user}
                            </Typography>
                            |
                            <PiSignOutFill color="#1976D2" size={32} style={{ cursor: 'pointer' }} onClick={handleLogout} />
                        </Box>
                    </Box>
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
        </>
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
