import * as React from "react"
import { Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  className?: string
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  )
  
  // Generate minutes (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  )

  const currentHour = date ? date.getHours().toString().padStart(2, '0') : ''
  const currentMinute = date ? date.getMinutes().toString().padStart(2, '0') : ''

  const handleHourChange = (hour: string) => {
    if (!date) {
      const newDate = new Date()
      newDate.setHours(parseInt(hour))
      newDate.setMinutes(0)
      setDate(newDate)
      return
    }
    const newDate = new Date(date)
    newDate.setHours(parseInt(hour))
    setDate(newDate)
  }

  const handleMinuteChange = (minute: string) => {
    if (!date) {
      const newDate = new Date()
      newDate.setMinutes(parseInt(minute))
      setDate(newDate)
      return
    }
    const newDate = new Date(date)
    newDate.setMinutes(parseInt(minute))
    setDate(newDate)
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Select value={currentHour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[100px]">
          <Clock className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((hour) => (
            <SelectItem key={hour} value={hour}>
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentMinute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((minute) => (
            <SelectItem key={minute} value={minute}>
              {minute}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 