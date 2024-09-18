import React from 'react'
import { RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, FormControlProps } from '@mui/material'
import { Control, Controller } from 'react-hook-form'

type RadioOption = {
    label: string
    value: any
}

type RadioFormProps = {
    name: string
    control: Control<any>
    items: RadioOption[]
    label?: string
    defaultValue?: any
    rules?: any // You can type this according to react-hook-form validation rules
    row?: boolean
} & FormControlProps

const RadioForm: React.FC<RadioFormProps> = ({ name, control, items, label, defaultValue, rules, row, ...props }) => {
    return (
        <FormControl {...props}>
            {label && <FormLabel component="legend">{label}</FormLabel>}
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                rules={rules}
                render={({ field, fieldState: { error } }) => (
                    <>
                        <RadioGroup {...field} row>
                            {items.map((item, index) => (
                                <FormControlLabel key={index.toString() + item.value} value={item.value} control={<Radio />} label={item.label} />
                            ))}
                        </RadioGroup>
                        {error && <span style={{ color: 'red' }}>{error.message}</span>}
                    </>
                )}
            />
        </FormControl>
    )
}

export default RadioForm
