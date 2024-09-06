import React, { useRef } from 'react'
import { useCalendar, useCalendarCell, useCalendarGrid } from 'react-aria'
import { useCalendarState } from 'react-stately'
import { createCalendar, getWeeksInMonth, CalendarDate } from '@internationalized/date'
import { useLocale } from 'react-aria' // Ensure this import is correct
import { NavButton } from './button'
import style from './calendar.module.css'
import arrowBack from './icon/back.svg'
import arrowNext from './icon/next.svg'
import Image from 'next/image'

interface CalendarProps {
    // Define the props expected for the Calendar component
}

const Calendar: React.FC<CalendarProps> = (props) => {
    const { locale } = useLocale()
    const state = useCalendarState({
        ...props,
        locale,
        createCalendar,
    })

    const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(props, state)

    return (
        <div {...calendarProps} className="calendar flex flex-col gap-3 text-[#8b6441] font-semibold text-sm">
            <div className="flex items-center justify-between w-full gap-2">
                <NavButton {...prevButtonProps}>
                    <Image src={arrowBack} alt="calendar" width={16} height={16} />
                </NavButton>
                <h2 className="uppercase">{title}</h2>
                <NavButton {...nextButtonProps}>
                    <Image src={arrowNext} alt="calendar" width={16} height={16} />
                </NavButton>
            </div>
            <CalendarGrid state={state} />
        </div>
    )
}

interface CalendarGridProps {
    state: ReturnType<typeof useCalendarState>
    // Add any additional props needed
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ state, ...props }) => {
    const { locale } = useLocale()
    const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state)

    // Get the number of weeks in the month so we can render the proper number of rows.
    const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale)

    return (
        <table {...gridProps}>
            <thead {...headerProps}>
                <tr>
                    {weekDays.map((day, index) => (
                        <th key={index}>{day}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
                    <tr key={weekIndex}>{state.getDatesInWeek(weekIndex).map((date, i) => (date ? <CalendarCell key={i} state={state} date={date} /> : <td key={i} />))}</tr>
                ))}
            </tbody>
        </table>
    )
}

interface CalendarCellProps {
    state: ReturnType<typeof useCalendarState>
    date: CalendarDate // Adjust the type based on the date object used
}

const CalendarCell: React.FC<CalendarCellProps> = ({ state, date }) => {
    const ref = useRef<HTMLDivElement>(null)
    const { cellProps, buttonProps, isSelected, isOutsideVisibleRange, isDisabled, isUnavailable, formattedDate } = useCalendarCell({ date }, state, ref)

    return (
        <td {...cellProps} className="text-center align-middle">
            <div
                {...buttonProps}
                ref={ref}
                hidden={isOutsideVisibleRange}
                className={`${style.cell} ${isSelected ? style.selected : ''} ${isDisabled ? 'disabled' : ''} ${isUnavailable ? 'unavailable' : ''} px-[10px] py-[8px] focus:outline-none`}
            >
                {formattedDate}
            </div>
        </td>
    )
}

export default Calendar
