'use client'
import { exportXLSXFile, getStartDate, getEndDate } from '@/utils'
import { Box, Button, Container, Typography, LinearProgress, Stack, LinearProgressProps, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import { useEffect, useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo'
import dayjs, { Dayjs } from 'dayjs'
import ErrorDialog from '@/components/error-dialog'
import Cookies from 'js-cookie'
import { PiSignOutFill } from 'react-icons/pi'
import { useRouter } from 'next/navigation'
import { generateXLSXData } from '@/service/invoice'
import { InvoiceKind, InvoiceType } from '@/types/invoice'

const ttxlyMap = {
    first: {
        value: '5',
        label: 'Đã cấp mã hóa đơn',
    },
    second: {
        value: '6',
        label: 'Tổng cục thuế đã nhận không mã',
    },
    third: {
        value: '8',
        label: 'Tổng cục thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền',
    },
}

export default function Home() {
    const router = useRouter()
    const [percent, setPercent] = useState('0')
    const [disableGetData, setDisableGetData] = useState(false)
    const [fromDate, setFromDate] = useState<Dayjs | null>()
    const [toDate, setToDate] = useState<Dayjs | null>()
    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [user, setUser] = useState('')
    const [invoiceType, setInvoiceType] = useState<InvoiceType>('sold')
    const [ttxly, setTtxly] = useState<string>(ttxlyMap.first.value)
    const [invoiceKind, setInvoiceKind] = useState<InvoiceKind>(InvoiceKind.normal)
    const [totalInvoice, setTotalInvoice] = useState(0)

    useEffect(() => {
        const userName = Cookies.get('username')
        setUser(userName || '')
    }, [])

    const updatePercent = (p: string) => {
        setPercent(p)
    }

    const updateTotalInvoice = (total: number) => {
        setTotalInvoice(total)
    }

    const handleError = (errMessage: string) => {
        setErrorMessage(errMessage || 'Có lỗi xảy ra')
        setOpen(true)
    }

    // handle download data
    const getData = async (invoiceType: InvoiceType) => {
        if (!fromDate || !toDate) {
            handleError('Vui lòng chọn ngày')
            return
        }
        const startDate = getStartDate(fromDate?.format('DD-MM-YYYY') || '')
        const endDate = getEndDate(toDate?.format('DD-MM-YYYY') || '')
        setDisableGetData(true)
        updateTotalInvoice(0)
        try {
            const input = {
                type: invoiceType,
                kind: invoiceKind,
                ttxly,
                startDate,
                endDate,
                updatePercent,
                updateTotalInvoice,
            }
            const xlsxData = await generateXLSXData(input)
            updatePercent('0')
            if (xlsxData?.length) {
                exportXLSXFile(xlsxData, input)
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

    const shouldDisableEndDate = (day: Dayjs) => {
        if (day.isAfter(dayjs())) {
            return true
        }
        if (fromDate) {
            if (day.isBefore(fromDate)) {
                return true
            }
            if (day.isAfter(fromDate.add(1, 'month'))) {
                return true
            }
        }
        return false
    }

    const shouldDisableStartDate = (day: Dayjs) => {
        if (day.isAfter(dayjs())) {
            return true
        }
        return false
    }

    const handleChangeInvoiceType = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInvoiceType(event.target.value as InvoiceType)
    }

    const handleChangeCheckType = (event: SelectChangeEvent): any => {
        setTtxly(event.target.value)
    }

    const handleChangeInvoiceKind = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInvoiceKind(Number(event.target.value) as InvoiceKind)
    }

    const handleGetData = () => {
        getData(invoiceType)
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

                    <FormControl>
                        <FormLabel id="invoice-type">Loại hóa đơn</FormLabel>
                        <RadioGroup row aria-labelledby="invoice-type" name="invoice-type" value={invoiceType} onChange={handleChangeInvoiceType}>
                            <FormControlLabel value="sold" control={<Radio />} label="Bán ra" />
                            <FormControlLabel value="purchase" control={<Radio />} label="Mua vào" />
                        </RadioGroup>
                    </FormControl>

                    {invoiceType === 'purchase' && (
                        <FormControl fullWidth>
                            <InputLabel id="check-type">Kết quả kiểm tra</InputLabel>
                            <Select labelId="check-type" id="check-type" value={ttxly} label="Kết quả kiểm tra" onChange={handleChangeCheckType}>
                                <MenuItem value={ttxlyMap.first.value}>{ttxlyMap.first.label}</MenuItem>
                                <MenuItem value={ttxlyMap.second.value}>{ttxlyMap.second.label}</MenuItem>
                                <MenuItem value={ttxlyMap.third.value}>{ttxlyMap.third.label}</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    <DemoContainer components={['DatePicker']}>
                        <DemoItem label="Từ ngày">
                            <DatePicker
                                slotProps={{
                                    field: {
                                        clearable: true,
                                    },
                                }}
                                shouldDisableDate={shouldDisableStartDate}
                                format="DD/MM/YYYY"
                                value={fromDate}
                                onChange={(v) => setFromDate(v)}
                            />
                        </DemoItem>
                        <DemoItem label="Đến ngày">
                            <DatePicker
                                slotProps={{
                                    field: {
                                        clearable: true,
                                    },
                                }}
                                shouldDisableDate={shouldDisableEndDate}
                                format="DD/MM/YYYY"
                                value={toDate}
                                onChange={(v) => setToDate(v)}
                            />
                        </DemoItem>
                    </DemoContainer>

                    <RadioGroup row aria-labelledby="invoice-kind" name="invoice-kind" value={invoiceKind} onChange={handleChangeInvoiceKind}>
                        <FormControlLabel value={InvoiceKind.normal} control={<Radio />} label="Hóa đơn điện tử" />
                        <FormControlLabel value={InvoiceKind.sco} control={<Radio />} label="Hóa đơn có mã khởi tạo từ máy tính tiền" />
                    </RadioGroup>

                    <Button disabled={disableGetData} onClick={handleGetData} variant="outlined" size="large">
                        Lấy dữ liệu
                    </Button>
                    {disableGetData && <LinearProgressWithLabel value={Number(percent)} />}
                    {totalInvoice > 0 && (
                        <Typography variant="body2" color="textSecondary">
                            Tổng số hóa đơn: {totalInvoice}
                        </Typography>
                    )}
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
