
export interface Resource {
  id: string;
  capacity: number;
  startDate?: string | Date;
  endDate?: string | Date;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
  offDays?: number[];
  offHours?: string[];
  slots?: any[];
}

export function generateDays(resource: Resource, daysToGenerate: number = 14) {
  if (!resource) return [];

  let start = new Date();
  let end = new Date();
  end.setDate(end.getDate() + daysToGenerate);

  if (resource.startDate && resource.endDate) {
    const rStart = new Date(resource.startDate);
    const rEnd = new Date(resource.endDate);
    
    // Use the later of (today OR resource start)
    if (rStart > start) {
      start = new Date(rStart);
      // Re-calculate end if we had a fixed window, but here we usually follow resource end
      end = new Date(rEnd);
    } else {
      // If resource started in the past, still start from today but respect resource end
      end = new Date(rEnd);
    }
  } else if (resource.startDate) {
     const rStart = new Date(resource.startDate);
     if (rStart > start) start = new Date(rStart);
     end = new Date(start);
     end.setDate(end.getDate() + daysToGenerate);
  }

  const arr = [];
  let curr = new Date(start);
  curr.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  const offDays = resource.offDays || [];

  // Limit to at most 60 days to prevent infinite loops or heavy UI
  let limit = 0;
  while (curr <= last && limit < 60) {
    if (!offDays.includes(curr.getDay())) {
      arr.push(new Date(curr));
    }
    curr.setDate(curr.getDate() + 1);
    limit++;
  }

  return arr;
}

export function generateSlots(resource: Resource, activeDate: Date) {
  if (!resource) return [];

  const slotDuration = resource.slotDuration || 60;
  const [startH, startM] = (resource.startTime || "09:00").split(':').map(Number);
  const [endH, endM] = (resource.endTime || "18:00").split(':').map(Number);

  // 1. Generate Virtual Slots for the active date
  const virtualSlots = [];
  let currentSlotTime = new Date(activeDate);
  currentSlotTime.setHours(startH, startM, 0, 0);

  const endDayTime = new Date(activeDate);
  endDayTime.setHours(endH, endM, 0, 0);

  const offHours = resource.offHours || [];

  while (currentSlotTime < endDayTime) {
    const nextSlotTime = new Date(currentSlotTime.getTime() + slotDuration * 60000);
    if (nextSlotTime > endDayTime) break;

    const timeStr = currentSlotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const isDefaultOff = offHours.includes(timeStr);

    virtualSlots.push({
      id: `virtual-|${currentSlotTime.toISOString()}|${nextSlotTime.toISOString()}`,
      startTime: new Date(currentSlotTime),
      endTime: new Date(nextSlotTime),
      isAvailable: !isDefaultOff,
      capacity: resource.capacity,
      _count: { reservations: 0 }
    });

    currentSlotTime = nextSlotTime;
  }

  // 2. Merge with actual database slots (exceptions)
  if (!resource.slots) return virtualSlots;

  return virtualSlots.map(vSlot => {
    const actualSlot = resource.slots?.find((s: any) =>
      new Date(s.startTime).getTime() === vSlot.startTime.getTime()
    );

    if (actualSlot) {
      return {
        ...vSlot,
        ...actualSlot,
        // Ensure startTime/endTime objects are preserved if backend sends strings
        startTime: new Date(actualSlot.startTime),
        endTime: new Date(actualSlot.endTime)
      };
    }
    return vSlot;
  });
}
