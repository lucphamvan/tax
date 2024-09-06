import React, { useRef } from 'react'
import { useDateFieldState } from 'react-stately'
import { AriaDateFieldProps, DateValue, useDateField, useDateSegment, useLocale } from 'react-aria'
import { createCalendar } from '@internationalized/date'
import style from './datefield.module.css'

const DateField: React.FC<AriaDateFieldProps<DateValue>> = (props) => {
    const { locale } = useLocale()
    const state = useDateFieldState({
        ...props,
        locale,
        createCalendar,
    })

    const ref = useRef<HTMLDivElement>(null)
    const { labelProps, fieldProps } = useDateField(props, state, ref)

    return (
        <div className={style.wrapper}>
            <span {...labelProps}>{props.label}</span>
            <div {...fieldProps} ref={ref} className={style.field}>
                {state.segments.map((segment, i) => (
                    <DateSegment key={i} segment={segment} state={state} />
                ))}
                {state.isInvalid && <span aria-hidden="true">🚫</span>}
            </div>
        </div>
    )
}

interface DateSegmentProps {
    segment: any // Replace `any` with the appropriate type for `segment`
    state: any // Replace `any` with the appropriate type for `state`
}

const DateSegment: React.FC<DateSegmentProps> = ({ segment, state }) => {
    const ref = useRef<HTMLDivElement>(null)
    const { segmentProps } = useDateSegment(segment, state, ref)

    return (
        <div {...segmentProps} ref={ref} className={style.segment}>
            {segment.text}
        </div>
    )
}

export default DateField
