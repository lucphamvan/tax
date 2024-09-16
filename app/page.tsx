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
import { generateXLSXData, InvoiceType } from '@/service/invoice'

const checkTypeMap = {
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
    const [checkType, setCheckType] = useState<string>(checkTypeMap.first.value)

    useEffect(() => {
        const userName = Cookies.get('username')
        setUser(userName || '')
    }, [])

    const handleError = (errMessage: string) => {
        setErrorMessage(errMessage || 'Có lỗi xảy ra')
        setOpen(true)
    }

    // handle download data
    const getData = async (type: InvoiceType) => {
        if (!fromDate || !toDate) {
            handleError('Vui lòng chọn ngày')
            return
        }
        const startDate = getStartDate(fromDate?.format('DD-MM-YYYY') || '')
        const endDate = getEndDate(toDate?.format('DD-MM-YYYY') || '')
        setDisableGetData(true)
        try {
            const xlsxData = await generateXLSXData(type, checkType, startDate, endDate, setPercent)
            setPercent('0')

            if (xlsxData?.length) {
                exportXLSXFile(type, xlsxData, startDate, endDate)
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
        setCheckType(event.target.value)
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
                            <Select labelId="check-type" id="check-type" value={checkType} label="Kết quả kiểm tra" onChange={handleChangeCheckType}>
                                <MenuItem value={checkTypeMap.first.value}>{checkTypeMap.first.label}</MenuItem>
                                <MenuItem value={checkTypeMap.second.value}>{checkTypeMap.second.label}</MenuItem>
                                <MenuItem value={checkTypeMap.third.value}>{checkTypeMap.third.label}</MenuItem>
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
                    <Button disabled={disableGetData} onClick={handleGetData} variant="outlined" size="large">
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
