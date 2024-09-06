import React, { useRef } from 'react'
import { AriaDatePickerProps, useDatePicker } from 'react-aria'
import { useDatePickerState } from 'react-stately'
import { CalendarButton, Calendar, DateField, Dialog, Popover } from './component'
import calendarImg from './icon/calendar.svg'
import Image from 'next/image'
import { DateValue } from '@react-types/datepicker'
interface DatePickerProps extends AriaDatePickerProps<DateValue> {
    showTimePicker?: boolean
    label: string
}

const DatePicker: React.FC<DatePickerProps> = (props) => {
    const state = useDatePickerState(props)
    const ref = useRef<HTMLDivElement>(null)
    const { groupProps, labelProps, fieldProps, buttonProps, dialogProps, calendarProps } = useDatePicker(props, state, ref)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div {...labelProps} className="mb-1 text-sm">
                {props.label}
            </div>
            <div {...groupProps} ref={ref} className="flex gap-1 items-center border-[#AD7F58] border rounded-[4px]">
                <DateField {...fieldProps} />
                <CalendarButton {...buttonProps}>
                    <Image src={calendarImg} alt="calendar" width={20} height={20} />
                </CalendarButton>
            </div>
            {state.isOpen && (
                <Popover state={state} triggerRef={ref} placement="bottom start">
                    <Dialog {...dialogProps}>
                        <Calendar {...calendarProps} />
                    </Dialog>
                </Popover>
            )}
        </div>
    )
}

export default DatePicker
