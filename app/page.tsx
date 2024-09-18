'use client'
import { exportXLSXFile, getStartDate, getEndDate } from '@/utils'
import { Box, Button, Container, Typography, LinearProgress, Stack, LinearProgressProps, FormControl, FormLabel, RadioGroup, FormControlLabel, SelectChangeEvent } from '@mui/material'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import RadioForm from '@/components/form/radio'
import SelectForm from '@/components/form/select'

const ttxlyOptions = [
    { value: '5', label: 'Đã cấp mã hóa đơn' },
    { value: '6', label: 'Tổng cục thuế đã nhận không mã' },
    { value: '8', label: 'Tổng cục thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền' },
]
const invoiceTypeOptions = [
    { label: 'Bán ra', value: 'sold' },
    { label: 'Mua vào', value: 'purchase' },
]

const invoiceKindOptions = [
    { label: 'Hóa đơn điện tử', value: InvoiceKind.normal },
    { label: 'Hóa đơn có mã khởi tạo từ máy tính tiền', value: InvoiceKind.sco },
]

type InputSchema = {
    type: InvoiceType
    ttxly: string
    kind: InvoiceKind
}

const schema = z.object({
    type: z.enum([invoiceTypeOptions[0].value, invoiceTypeOptions[1].value]),
    ttxly: z.enum([ttxlyOptions[0].value, ttxlyOptions[1].value, ttxlyOptions[2].value]),
    kind: z.nativeEnum(InvoiceKind),
})

const initData = {
    type: invoiceTypeOptions[0].value as InvoiceType,
    ttxly: ttxlyOptions[0].value,
    kind: invoiceKindOptions[0].value as InvoiceKind,
}

export default function Home() {
    const router = useRouter()
    const [percent, setPercent] = useState('0')
    const [fromDate, setFromDate] = useState<Dayjs | null>()
    const [toDate, setToDate] = useState<Dayjs | null>()
    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [user, setUser] = useState('')
    const [totalInvoice, setTotalInvoice] = useState(0)

    const {
        watch,
        handleSubmit,
        formState: { isSubmitting },
        control,
    } = useForm<InputSchema>({
        resolver: zodResolver(schema),
        defaultValues: initData,
    })

    const isPurchaseType = watch('type') === 'purchase'

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
    const onSubmit = async (data: InputSchema) => {
        console.log('data', data)
        if (!fromDate || !toDate) {
            handleError('Vui lòng chọn ngày')
            return
        }
        const startDate = getStartDate(fromDate?.format('DD-MM-YYYY') || '')
        const endDate = getEndDate(toDate?.format('DD-MM-YYYY') || '')
        updateTotalInvoice(0)
        try {
            const input = {
                type: data.type,
                kind: data.kind,
                ttxly: data.ttxly,
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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={4}>
                        <Typography variant="h4">Lấy dữ liệu hóa đơn</Typography>
                        <RadioForm name="type" control={control} label="Loại hóa đơn" fullWidth row items={invoiceTypeOptions} />

                        {isPurchaseType && <SelectForm name="ttxly" control={control} label="Kết quả kiểm tra" fullWidth items={ttxlyOptions} />}

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

                        <RadioForm name="kind" control={control} fullWidth row items={invoiceKindOptions} />

                        <Button type="submit" disabled={isSubmitting} variant="outlined" size="large">
                            Lấy dữ liệu
                        </Button>
                        {isSubmitting && <LinearProgressWithLabel value={Number(percent)} />}
                        {totalInvoice > 0 && (
                            <Typography variant="body2" color="textSecondary">
                                Tổng số hóa đơn: {totalInvoice}
                            </Typography>
                        )}
                    </Stack>
                </form>
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
