import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { PiEyeThin, PiEyeSlashLight } from 'react-icons/pi'
import { register } from 'module'

interface PasswordFieldProps {
    label: string
    name: string
    register?: any
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, register, name }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <TextField
            label={label}
            type={showPassword ? 'text' : 'password'}
            {...register(name)}
            fullWidth
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                            {showPassword ? <PiEyeThin /> : <PiEyeSlashLight />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
}

export default PasswordField
