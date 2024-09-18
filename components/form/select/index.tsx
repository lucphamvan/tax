import React from 'react'
import { FormControl, FormControlProps, Select, MenuItem, InputLabel } from '@mui/material'
import { Control, Controller } from 'react-hook-form'

type SelectOption = {
    label: string
    value: any
}

type SelectFormProps = {
    name: string
    control: Control<any>
    items: SelectOption[]
    label?: string
    defaultValue?: any
    rules?: any // You can type this according to react-hook-form validation rules
} & FormControlProps

const SelectForm: React.FC<SelectFormProps> = ({ name, control, items, label, defaultValue = '', rules, ...props }) => {
    return (
        <FormControl {...props}>
            {label && <InputLabel>{label}</InputLabel>}
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                rules={rules}
                render={({ field, fieldState: { error } }) => (
                    <>
                        <Select {...field} label={label}>
                            {items.map((item, index) => (
                                <MenuItem key={index.toString() + item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {error && <span style={{ color: 'red' }}>{error.message}</span>}
                    </>
                )}
            />
        </FormControl>
    )
}

export default SelectForm
