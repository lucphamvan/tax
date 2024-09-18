import { DatePicker, DatePickerProps } from '@mui/x-date-pickers'
import { DemoItem } from '@mui/x-date-pickers/internals/demo'
import { Dayjs } from 'dayjs'
import { Controller } from 'react-hook-form'

interface Props extends DatePickerProps<Dayjs, false> {
    label?: string
    name: string
    control: any
    defaultValue?: any
}

const DatePickerForm: React.FC<Props> = ({ name, label, defaultValue, control, ...props }) => {
    return (
        <DemoItem label={label}>
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                render={({ field, fieldState: { error } }) => (
                    <>
                        <DatePicker
                            {...field}
                            {...props}
                            slotProps={{
                                field: {
                                    clearable: true,
                                },
                            }}
                            format="DD/MM/YYYY"
                        />
                        {error && <span style={{ color: 'red' }}>{error.message}</span>}
                    </>
                )}
            />
        </DemoItem>
    )
}
export default DatePickerForm
