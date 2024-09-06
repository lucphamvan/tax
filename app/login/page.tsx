'use client'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { getCaptcha } from '@/service/captcha'
import { AuthenInput } from '@/types/captcha'
import { useRouter } from 'next/navigation'
import axios from 'axios'

import { useState } from 'react'
import { Button, Stack, TextField, Typography, Container, Box, Grid2 as Grid } from '@mui/material'
import Image from 'next/image'
import refreshIcon from '@/img/refresh.svg'
import { DiUnitySmall } from 'react-icons/di'
import ErrorDialog from '@/components/error-dialog'
import PasswordField from '@/components/password'
import Cookies from 'js-cookie'

type LoginRequest = {
    username: string
    password: string
    captcha: string
}

const LoginPage = () => {
    const router = useRouter()

    const {
        handleSubmit,
        register,
        formState: { isSubmitting },
    } = useForm<LoginRequest>()

    const { data, refetch } = useQuery({ queryKey: ['captcha'], queryFn: getCaptcha, refetchOnWindowFocus: false })

    const [isDialogOpen, setDialogOpen] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')

    const handleOpenDialog = (message: string) => {
        setErrorMessage(message)
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
    }

    const clearSession = () => {
        Cookies.remove('username')
        Cookies.remove('token')
    }

    // hanlde login
    const onLogin: SubmitHandler<LoginRequest> = async (request) => {
        try {
            const authenInput: AuthenInput = {
                username: request.username,
                password: request.password,
                cvalue: request.captcha,
                ckey: data?.key || '',
            }
            Cookies.set('username', request.username)
            await axios.post('/api/login', authenInput)
            router.push('/')
        } catch (error: any) {
            clearSession()
            handleOpenDialog(error.response?.data?.message)
            refreshCatpcha()
        }
    }

    // refresh captcha
    const refreshCatpcha = () => {
        refetch()
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
            <Box sx={{ minWidth: '400px', padding: '2rem', borderRadius: '1rem', bgcolor: 'white' }}>
                <form onSubmit={handleSubmit(onLogin)}>
                    <Stack spacing={4}>
                        <Box>
                            <DiUnitySmall size={48} color="#1976D2" />
                            <Grid container spacing={10}>
                                <Grid display="flex" flexDirection="column">
                                    <Typography variant="h4" textAlign="center">
                                        Đăng nhập
                                    </Typography>
                                </Grid>
                                <Grid>
                                    <Stack spacing={4}>
                                        <Grid container spacing={2}>
                                            <Grid size={{ sm: 12, md: 6, xs: 12 }}>
                                                <TextField fullWidth sx={{ minWidth: '250px' }} label="Tên đăng nhập" {...register('username')} />
                                            </Grid>
                                            <Grid size={{ sm: 12, md: 6, xs: 12 }}>
                                                <PasswordField label="Mật khẩu" name="password" register={register} />
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2} style={{ width: '100%' }}>
                                            <Grid size={{ sm: 12, md: 6, xs: 12 }} alignItems="center" display="flex" bgcolor="#DCDCDC" borderRadius="4px" position="relative" minWidth={250}>
                                                <Box dangerouslySetInnerHTML={{ __html: data?.content || '' }} style={{ width: 'auto' }} />
                                                <Image src={refreshIcon} alt="refresh" width={24} style={{ cursor: 'pointer', position: 'absolute', right: 10 }} onClick={refreshCatpcha} />
                                            </Grid>
                                            <Grid size={{ sm: 12, md: 6, xs: 12 }}>
                                                <TextField fullWidth sx={{ minWidth: '250px' }} id="captcha" {...register('captcha')} label="Nhập mã captcha" />
                                            </Grid>
                                        </Grid>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                            <Button size="large" variant="contained" type="submit" disabled={isSubmitting} sx={{ textTransform: 'none' }}>
                                Đăng nhập
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Box>
            <ErrorDialog open={isDialogOpen} onClose={handleCloseDialog} message={errorMessage} />
        </Container>
    )
}
export default LoginPage
